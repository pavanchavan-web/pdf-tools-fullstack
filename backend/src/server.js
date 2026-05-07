import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { PassThrough } from "stream";

import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { jobQueue } from "./queue.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import editPdfJob from "./jobs/edit-pdf.js";

const exec = promisify(execCb);
const app = express();

/* TRUST PROXY (REQUIRED FOR RENDER / VERCEL) */
app.set("trust proxy", 1);

sharp.cache(false);
sharp.concurrency(2);

/* ================= SECURITY ================= */

// Hide Express fingerprint
app.disable("x-powered-by");

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Rate limiting (API protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

// CORS (safe but flexible)
const allowedOrigins = [
  "http://localhost:5173",
  "https://pdf-tools-fullstack.vercel.app",
  "https://pdf-tools-fullstack.onrender.com",
  "https://convertzip.com",
  "https://www.convertzip.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());


/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= MULTER ================= */

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
});

/* ================= HELPERS ================= */

// BLOCK Raster → SVG
function isRasterToSvg(file, targetFormat) {
  return (
    targetFormat === "svg" &&
    file.mimetype &&
    file.mimetype !== "image/svg+xml"
  );
}


/* ================= MERGE PDF ================= */
app.post("/api/merge", upload.array("files"), async (req, res) => {
  try {
    const pdfBytes = await jobQueue.add(async () => {
      const mergedPdf = await PDFDocument.create();

      for (const file of req.files) {
        const bytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
        fs.unlinkSync(file.path);
      }

      return await mergedPdf.save();
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=merged.pdf",
    });
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      code: "MERGE_FAILED",
      message: "Failed to merge PDF files",
    });
  }
});

/* ================= SPLIT PDF ================= */
app.post("/api/split", upload.single("file"), async (req, res) => {
  try {
    const zipBuffer = await jobQueue.add(async () => {
      const pdfBytes = fs.readFileSync(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const zip = archiver("zip");
      const chunks = [];

      zip.on("data", d => chunks.push(d));

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        zip.append(Buffer.from(await newPdf.save()), {
          name: `page-${i + 1}.pdf`,
        });
      }

      await zip.finalize();
      fs.unlinkSync(req.file.path);
      return Buffer.concat(chunks);
    });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=split-pages.zip",
    });
    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      code: "SPLIT_FAILED",
      message: "PDF split failed",
    });
  }
});

/* ================= COMPRESS PDF ================= */
app.post("/api/compress", upload.single("file"), async (req, res) => {
  const output = `compressed-${Date.now()}.pdf`;
  const gsCmd =
    process.platform === "win32"
      ? `"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe"`
      : "gs";

  try {
    await jobQueue.add(
      () =>
        new Promise((resolve, reject) => {
          exec(
            `${gsCmd} -sDEVICE=pdfwrite -dPDFSETTINGS=/screen -dNOPAUSE -dBATCH -sOutputFile=${output} ${req.file.path}`,
            err => (err ? reject(err) : resolve())
          );
        })
    );

    res.download(output, () => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(output);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      code: "IMAGE_COMPRESS_FAILED",
      message: "Image compression failed",
    });
  }
});

/* ================= IMAGE → PDF ================= */
app.post("/api/image-to-pdf", upload.array("files", 30), async (req, res) => {
  try {
    const pdfBytes = await jobQueue.add(async () => {
      const pdfDoc = await PDFDocument.create();
      let validImageCount = 0;

      for (const file of req.files) {
        try {
          let imageBuffer = null;
          let embedType = null;

          // ✅ PNG
          if (file.mimetype === "image/png") {
            imageBuffer = fs.readFileSync(file.path);
            embedType = "png";
          }

          // ✅ JPG / JPEG
          else if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg"
          ) {
            imageBuffer = fs.readFileSync(file.path);
            embedType = "jpg";
          }

          // ✅ WEBP → convert to PNG
          else if (file.mimetype === "image/webp") {
            imageBuffer = await sharp(file.path).png().toBuffer();
            embedType = "png";
          }

          // ❌ Unsupported image → skip
          else {
            fs.unlinkSync(file.path);
            continue;
          }

          const image =
            embedType === "png"
              ? await pdfDoc.embedPng(imageBuffer)
              : await pdfDoc.embedJpg(imageBuffer);

          const page = pdfDoc.addPage([
            image.width,
            image.height,
          ]);

          page.drawImage(image, { x: 0, y: 0 });

          validImageCount++;
          fs.unlinkSync(file.path);
        } catch (innerErr) {
          console.error(
            "Skipped image:",
            file.originalname,
            innerErr.message
          );
          try {
            fs.unlinkSync(file.path);
          } catch {}
        }
      }

      // ❌ Nothing valid
      if (validImageCount === 0) {
        throw new Error("NO_VALID_IMAGES");
      }

      return await pdfDoc.save();
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=images.pdf",
    });

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("Image → PDF error:", err);

    const message =
      err.message === "NO_VALID_IMAGES"
        ? "No supported images found. Supported: JPG, PNG, WEBP."
        : "Image to PDF conversion failed";

    res.status(500).json({
      error: true,
      code: "IMAGE_PDF_FAILED",
      message,
    });
  }
});


/* ===================== IMAGE Converts ===================== */
app.post("/api/image-convert", upload.array("files", 20), async (req, res) => {
  try {
    const formats = JSON.parse(req.body.formats);

    const zipBuffer = await jobQueue.add(async () => {
      const zip = archiver("zip");
      const chunks = [];
      zip.on("data", d => chunks.push(d));

      let successCount = 0;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const format = formats[i];
        const base = path.parse(file.originalname).name;

        try {
          let buffer;

          /* ❌ Raster → SVG NOT supported */
          if (format === "svg" && file.mimetype !== "image/svg+xml") {
            zip.append(
              Buffer.from("Raster to SVG conversion is not supported."),
              { name: `${base}-ERROR.txt` }
            );
            continue;
          }

          /* ❌ BMP output NOT supported */
          if (format === "bmp") {
            zip.append(
              Buffer.from("BMP output format is not supported."),
              { name: `${base}-ERROR.txt` }
            );
            continue;
          }

          /* ✅ All other formats via Sharp */
          buffer = await sharp(file.path)
            .toFormat(format)
            .toBuffer();

          zip.append(buffer, { name: `${base}.${format}` });
          successCount++;
        } catch (err) {
          // 🔕 File-level failure (do NOT kill job)
          zip.append(
            Buffer.from(`Conversion failed: ${err.message}`),
            { name: `${base}-ERROR.txt` }
          );
        } finally {
          // 🧹 Always cleanup temp file
          try {
            fs.unlinkSync(file.path);
          } catch {}
        }
      }

      // 🚨 FAIL JOB ONLY IF NOTHING CONVERTED
      if (successCount === 0) {
        throw new Error("All image conversions failed");
      }

      await zip.finalize();
      return Buffer.concat(chunks);
    });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=converted-images.zip",
    });
    res.send(zipBuffer);

  } catch (err) {
    console.error("Image convert error:", err);
    res.status(500).json({
      error: true,
      code: "IMAGE_CONVERT_FAILED",
      message: err.message || "Image conversion failed",
    });
  }
});


/* ================= PDF IMAGE EXTRACT ================= */
app.post("/api/pdf-image-extract", upload.single("file"), async (req, res) => {
  const extractDir = `extract-${Date.now()}`;
  fs.mkdirSync(extractDir);

  try {
    const zipBuffer = await jobQueue.add(
      () =>
        new Promise((resolve, reject) => {
          exec(
            `pdfimages -all "${req.file.path}" "${extractDir}/img"`,
            err => {
              if (err) return reject(err);

              const zip = archiver("zip");
              const chunks = [];
              zip.on("data", d => chunks.push(d));

              fs.readdirSync(extractDir).forEach(file => {
                zip.file(`${extractDir}/${file}`, { name: file });
              });

              zip.finalize().then(() => {
                fs.rmSync(extractDir, { recursive: true, force: true });
                fs.unlinkSync(req.file.path);
                resolve(Buffer.concat(chunks));
              });
            }
          );
        })
    );

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=pdf-images.zip",
    });
    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      code: "IMAGE_EXTRACTION_FAILED",
      message: "Image extraction failed",
      details: err.message,
    });
  }
});

/* ================= IMAGE COMPRESS ================= */
app.post("/api/image-compress", upload.array("files", 20), async (req, res) => {
  try {
    const quality = Math.min(
      99,
      Math.max(20, Number(req.body.quality) || 80)
    );

    const format = req.body.format || "webp";
    const keepOriginal = req.body.keepOriginal === "true";

    const zipBuffer = await jobQueue.add(async () => {
      const zip = archiver("zip");
      const chunks = [];
      zip.on("data", (d) => chunks.push(d));

      let successCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        try {
          // ❌ Skip BMP (Sharp limitation)
          if (file.mimetype === "image/bmp") {
            skippedCount++;
            fs.unlinkSync(file.path);
            continue;
          }

          const input = sharp(file.path).resize({
            width: 2000,
            withoutEnlargement: true,
          });

          // ✅ Decide output format
          let outputFormat;
          if (keepOriginal) {
            outputFormat = file.mimetype.split("/")[1];
          } else {
            outputFormat = format;
          }

          // ❌ Sharp does not support "original"
          if (!outputFormat || outputFormat === "original") {
            outputFormat = "webp";
          }

          const buffer = await input
            .toFormat(outputFormat, { quality })
            .toBuffer();

          const base = path.parse(file.originalname).name;
          const uniqueName = `${base}-${Date.now()}-${i}.${outputFormat}`;

          zip.append(buffer, { name: uniqueName });

          successCount++;
          fs.unlinkSync(file.path);
        } catch (innerErr) {
          skippedCount++;
          fs.unlinkSync(file.path);
        }
      }

      // ❌ If nothing succeeded → real error
      if (successCount === 0) {
        throw new Error(
          "No supported images found. BMP images are not supported."
        );
      }

      // ℹ️ Info file if partial success
      if (skippedCount > 0) {
        zip.append(
          Buffer.from(
            `${skippedCount} image(s) were skipped due to unsupported format.`
          ),
          { name: "INFO.txt" }
        );
      }

      await zip.finalize();
      return Buffer.concat(chunks);
    });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=compressed-images.zip",
    });

    res.send(zipBuffer);
  } catch (err) {
    console.error("Image compress error:", err);

    res.status(500).json({
      error: true,
      code: "IMAGE_COMPRESSION_FAILED",
      message: err.message || "Image compression failed",
    });
  }
});

/* ================= EDIT PDF ================= */
app.post("/api/edit-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({
        error: true,
        code: "NO_FILE_UPLOADED",
        message: "Please upload a PDF file",
      });
    }

    let edits = [];
    if (req.body.edits) {
      try {
        edits =
          typeof req.body.edits === "string"
            ? JSON.parse(req.body.edits)
            : req.body.edits;
      } catch {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          error: true,
          code: "INVALID_EDITS",
          message: "Invalid edits payload",
        });
      }
    }

    const pdfBytes = await jobQueue.add(async () =>
      editPdfJob({
        filePath: req.file.path,
        edits,
      })
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=edited.pdf",
    });

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("Edit PDF error:", err);
    res.status(500).json({
      error: true,
      code: "EDIT_PDF_FAILED",
      message: err.message || "PDF editing failed",
    });
  }
});


/* ================= PDF → DOCX ================= */
app.post("/api/pdf-to-docx", upload.array("files", 5), async (req, res) => {
    try {
      const zipBuffer = await jobQueue.add(async () => {

        /* ================= ZIP SETUP ================= */

        const archive = archiver("zip", {
          zlib: { level: 9 },
        });

        const stream = new PassThrough();

        const chunks = [];

        stream.on("data", (chunk) => {
          chunks.push(chunk);
        });

        archive.pipe(stream);

        let successCount = 0;

        /* ================= FILE LOOP ================= */

        for (let i = 0; i < req.files.length; i++) {

          const file = req.files[i];

          try {

            const inputPath = file.path;

            const outputDir = path.dirname(inputPath);

            console.log(
              "Starting conversion:",
              file.originalname
            );

            /* ================= CONVERT ================= */

            await exec(
              `libreoffice --headless --nologo --convert-to docx "${inputPath}" --outdir "${outputDir}"`
            );

            /* ================= WAIT ================= */

            await new Promise((resolve) =>
              setTimeout(resolve, 1500)
            );

            /* ================= FIND GENERATED DOCX ================= */

            const baseName = path.parse(
              file.originalname
            ).name;

            const files = fs.readdirSync(outputDir);

            console.log(
              "Files in output dir:",
              files
            );

            const generatedDocx = files.find(
              (f) =>
                f.toLowerCase().endsWith(".docx") &&
                (
                  f.startsWith(baseName) ||
                  f.includes(baseName)
                )
            );

            if (!generatedDocx) {
              throw new Error(
                `DOCX file not generated for ${file.originalname}`
              );
            }

            const outputPath = path.join(
              outputDir,
              generatedDocx
            );

            console.log(
              "Generated DOCX:",
              outputPath
            );

            /* ================= READ FILE ================= */

            const buffer = fs.readFileSync(
              outputPath
            );

            /* ================= ZIP FILE NAME ================= */

            const uniqueName =
              `${baseName}-${Date.now()}-${i}.docx`;

            archive.append(buffer, {
              name: uniqueName,
            });

            successCount++;

            console.log(
              "Added to ZIP:",
              uniqueName
            );

            /* ================= CLEANUP ================= */

            try {

              if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
              }

            } catch (cleanupErr) {

              console.error(
                "DOCX cleanup failed:",
                cleanupErr.message
              );

            }

            try {

              if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
              }

            } catch (cleanupErr) {

              console.error(
                "PDF cleanup failed:",
                cleanupErr.message
              );

            }

          } catch (err) {

            console.error(
              "DOCX convert error:",
              err
            );

            try {

              if (
                file.path &&
                fs.existsSync(file.path)
              ) {
                fs.unlinkSync(file.path);
              }

            } catch {}

          }
        }

        /* ================= VALIDATION ================= */

        if (successCount === 0) {

          throw new Error(
            "No valid PDF files converted"
          );

        }

        /* ================= FINALIZE ZIP ================= */

        await archive.finalize();

        await new Promise((resolve, reject) => {

          stream.on("end", resolve);

          stream.on("error", reject);

          archive.on("error", reject);

        });

        console.log(
          `ZIP created successfully with ${successCount} files`
        );

        return Buffer.concat(chunks);

      });

      /* ================= RESPONSE ================= */

      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition":
          "attachment; filename=pdf-to-docx.zip",
      });

      res.send(zipBuffer);

    } catch (err) {

      console.error(
        "PDF to DOCX error:",
        err
      );

      res.status(500).json({
        error: true,
        code: "PDF_TO_DOCX_FAILED",
        message:
          err.message || "Conversion failed",
      });

    }
  }
);


/* ================= START ================= */
app.listen(5000, () => {
  console.log("✅ API running on http://localhost:5000");
});
