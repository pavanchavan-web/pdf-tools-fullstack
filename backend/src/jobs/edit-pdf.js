import fs from "fs";
import path from "path";

import {
  PDFDocument,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";

// =====================================================
// FONT DIRECTORY
// =====================================================

const FONT_DIR = path.join(process.cwd(), "fonts");

// =====================================================
// SAFE DELETE TEMP FILE
// =====================================================

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(
      `Failed to remove temp file: ${filePath}`,
      err
    );
  }
}

// =====================================================
// PARSE HEX COLOR
// =====================================================

function parseHexColor(value) {
  if (typeof value !== "string") {
    return rgb(0, 0, 0);
  }

  const hex = value.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return rgb(0, 0, 0);
  }

  const r =
    Number.parseInt(hex.slice(0, 2), 16) / 255;

  const g =
    Number.parseInt(hex.slice(2, 4), 16) / 255;

  const b =
    Number.parseInt(hex.slice(4, 6), 16) / 255;

  return rgb(r, g, b);
}

// =====================================================
// CUSTOM FONT PATH
// =====================================================

function getCustomFontPath(
  fontFamily,
  fontWeight
) {
  const family = String(
    fontFamily || "Poppins"
  ).toLowerCase();

  const isBold = [
    "bold",
    "500",
    "600",
    "700",
    "800",
    "900",
  ].includes(
    String(fontWeight || "").toLowerCase()
  );

  // =========================
  // ROBOTO
  // =========================

  if (family.includes("roboto")) {
    return path.join(
      FONT_DIR,
      isBold
        ? "Roboto-Bold.ttf"
        : "Roboto-Regular.ttf"
    );
  }

  // =========================
  // INTER
  // =========================

  if (family.includes("inter")) {
    return path.join(
      FONT_DIR,
      isBold
        ? "Inter-Bold.ttf"
        : "Inter-Regular.ttf"
    );
  }

  // =========================
  // TIMES NEW ROMAN STYLE
  // =========================

  if (
    family.includes("times") ||
    family.includes("serif")
  ) {
    return path.join(
      FONT_DIR,
      isBold
        ? "Times-Bold.ttf"
        : "Times-Regular.ttf"
    );
  }

  // =========================
  // DEFAULT POPPINS
  // =========================

  return path.join(
    FONT_DIR,
    isBold
      ? "Poppins-Bold.ttf"
      : "Poppins-Regular.ttf"
  );
}

// =====================================================
// NORMALIZE URL
// =====================================================

function normalizeUrl(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed)
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

// =====================================================
// ADD LINK ANNOTATION
// =====================================================

function addLinkAnnotation(
  pdfDoc,
  page,
  url,
  rect
) {
  const href = normalizeUrl(url);

  if (!href) return;

  const annotation = pdfDoc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [
      rect.x,
      rect.y,
      rect.x + rect.width,
      rect.y + rect.height,
    ],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(href),
    },
  });

  const annotationRef =
    pdfDoc.context.register(annotation);

  page.node.addAnnot(annotationRef);
}

// =====================================================
// PARSE EDITS
// =====================================================

function parseEdits(edits) {
  const parsed =
    typeof edits === "string"
      ? JSON.parse(edits)
      : edits ?? [];

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid edits payload");
  }

  return parsed;
}

// =====================================================
// MAIN EDIT PDF JOB
// =====================================================

export default async function editPdfJob({
  filePath,
  buffer,
  edits = [],
} = {}) {
  if (!filePath && !buffer) {
    throw new Error("No PDF input provided");
  }

  try {
    // =====================================================
    // LOAD PDF
    // =====================================================

    const inputBytes =
      buffer ?? fs.readFileSync(filePath);

    const pdfDoc =
      await PDFDocument.load(inputBytes);

    // =====================================================
    // REGISTER FONTKIT
    // =====================================================

    pdfDoc.registerFontkit(fontkit);

    const parsedEdits = parseEdits(edits);

    const embeddedFonts = new Map();

    // =====================================================
    // LOOP THROUGH EDITS
    // =====================================================

    for (const edit of parsedEdits) {
      if (!edit || typeof edit !== "object") {
        continue;
      }

      const pageIndex =
        Number(edit.page) - 1;

      if (
        !Number.isInteger(pageIndex) ||
        pageIndex < 0
      ) {
        continue;
      }

      if (
        pageIndex >= pdfDoc.getPageCount()
      ) {
        continue;
      }

      const scale =
        Number(edit.scale) > 0
          ? Number(edit.scale)
          : 1;

      const x = Number(edit.x);
      const y = Number(edit.y);

      const width = Number(edit.width);

      const height = Number(edit.height);

      const fontSize = Number(
        edit.fontSize
      );

      const lineHeight = Number(
        edit.lineHeight
      );

      if (
        ![
          x,
          y,
          width,
          height,
          fontSize,
        ].every(Number.isFinite)
      ) {
        continue;
      }

      // =====================================================
      // PAGE
      // =====================================================

      const page = pdfDoc.getPage(
        pageIndex
      );

      const pageHeight =
        page.getHeight();

      const pdfX = x / scale;

      const pdfWidth = Math.max(
        width / scale,
        1
      );

      const pdfHeight = Math.max(
        height / scale,
        (
          Number.isFinite(lineHeight)
            ? lineHeight
            : fontSize * 1.3
        ) / scale
      );

      const rectY =
        pageHeight -
        (y + height) / scale;

      // =====================================================
      // WHITE PATCH
      // =====================================================

      page.drawRectangle({
        x: Math.max(pdfX - 1, 0),
        y: Math.max(rectY - 1, 0),
        width: pdfWidth + 2,
        height: pdfHeight + 2,
        color: rgb(1, 1, 1),
      });

      // =====================================================
      // TEXT
      // =====================================================

      const rawText =
        typeof edit.text === "string"
          ? edit.text
          : "";

      const hasText = Boolean(rawText);

      if (!hasText && !edit.link) {
        continue;
      }

      // =====================================================
      // FONT PATH
      // =====================================================

      const fontPath =
        getCustomFontPath(
          edit.fontFamily,
          edit.fontWeight
        );

      let font;

      try {
        // =====================================================
        // EMBED FONT
        // =====================================================

        if (!embeddedFonts.has(fontPath)) {
          const fontBytes =
            fs.readFileSync(fontPath);

          const embeddedFont =
            await pdfDoc.embedFont(
              fontBytes
            );

          embeddedFonts.set(
            fontPath,
            embeddedFont
          );
        }

        font =
          embeddedFonts.get(fontPath);
      } catch (err) {
        console.log(
          "Custom font failed, fallback Helvetica",
          err
        );

        // =====================================================
        // FALLBACK FONT
        // =====================================================

        if (
          !embeddedFonts.has(
            StandardFonts.Helvetica
          )
        ) {
          embeddedFonts.set(
            StandardFonts.Helvetica,
            await pdfDoc.embedFont(
              StandardFonts.Helvetica
            )
          );
        }

        font = embeddedFonts.get(
          StandardFonts.Helvetica
        );
      }

      // =====================================================
      // PDF FONT SIZE
      // =====================================================

      const pdfFontSize =
        fontSize / scale;

      const pdfLineHeight =
        (
          Number.isFinite(lineHeight)
            ? lineHeight
            : fontSize * 1.3
        ) / scale;

      const textColor =
        parseHexColor(edit.color);

      const textLines =
        rawText.split(/\r?\n/);

      // =====================================================
      // LONGEST LINE
      // =====================================================

      const longestLineWidth =
        textLines.reduce(
          (maxWidth, line) =>
            Math.max(
              maxWidth,
              font.widthOfTextAtSize(
                line || " ",
                pdfFontSize
              )
            ),
          0
        );

      let drawX = pdfX;

      // =====================================================
      // TEXT ALIGN
      // =====================================================

      if (edit.textAlign === "center") {
        drawX += Math.max(
          (pdfWidth - longestLineWidth) /
            2,
          0
        );
      } else if (
        edit.textAlign === "right"
      ) {
        drawX += Math.max(
          pdfWidth - longestLineWidth,
          0
        );
      }

      // =====================================================
      // DRAW TEXT
      // =====================================================

      if (rawText) {
        page.drawText(rawText, {
          x: drawX,
          y:
            pageHeight -
            y / scale -
            pdfFontSize,
          size: pdfFontSize,
          lineHeight: pdfLineHeight,
          maxWidth: pdfWidth,
          font,
          color: textColor,
        });
      }

      // =====================================================
      // UNDERLINE
      // =====================================================

      if (edit.underline) {
        textLines.forEach(
          (line, index) => {
            const lineWidth =
              font.widthOfTextAtSize(
                line || " ",
                pdfFontSize
              );

            let lineX = pdfX;

            if (
              edit.textAlign ===
              "center"
            ) {
              lineX += Math.max(
                (
                  pdfWidth -
                  lineWidth
                ) / 2,
                0
              );
            } else if (
              edit.textAlign ===
              "right"
            ) {
              lineX += Math.max(
                pdfWidth - lineWidth,
                0
              );
            }

            const lineY =
              pageHeight -
              y / scale -
              pdfFontSize -
              index *
                pdfLineHeight -
              pdfFontSize * 0.12;

            page.drawLine({
              start: {
                x: lineX,
                y: lineY,
              },
              end: {
                x: lineX + lineWidth,
                y: lineY,
              },
              thickness: Math.max(
                pdfFontSize * 0.045,
                0.6
              ),
              color: textColor,
            });
          }
        );
      }

      // =====================================================
      // LINK
      // =====================================================

      addLinkAnnotation(
        pdfDoc,
        page,
        edit.link,
        {
          x: pdfX,
          y: rectY,
          width: pdfWidth,
          height: pdfHeight,
        }
      );
    }

    // =====================================================
    // SAVE PDF
    // =====================================================

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    return Buffer.from(pdfBytes);
  } catch (err) {
    console.error(err);

    throw new Error(
      `Edit PDF job failed: ${err.message}`
    );
  } finally {
    safeUnlink(filePath);
  }
}