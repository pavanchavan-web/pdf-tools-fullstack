import { useState } from "react";
import { Helmet } from "react-helmet-async";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";
import { useNotify } from "../context/NotificationContext";

const MAX_FILES = 30;
const MAX_TOTAL_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function ImageToPdf() {
  /* ================= STATE ================= */
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const { notify } = useNotify();

  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  /* ================= ADD FILES ================= */
  const addFiles = (newFiles) => {
    const combined = [...files, ...newFiles];

    // 🔒 Max files
    if (combined.length > MAX_FILES) {
      notify("warning", `Maximum ${MAX_FILES} images allowed`);
      return;
    }

    // 🔒 Total size
    const totalSize = combined.reduce(
      (sum, f) => sum + f.size,
      0
    );
    if (totalSize > MAX_TOTAL_SIZE) {
      notify(
        "error",
        "Total upload size exceeds 1GB limit"
      );
      return;
    }

    // 🚫 Unsupported formats
    const unsupported = newFiles.filter(
      (f) => !ALLOWED_TYPES.includes(f.type)
    );

    if (unsupported.length > 0) {
      notify(
        "warning",
        `${unsupported.length} image(s) skipped (BMP, GIF, SVG not supported for PDF)`
      );
    }

    // ✅ Keep only valid images
    const validFiles = newFiles.filter((f) =>
      ALLOWED_TYPES.includes(f.type)
    );

    if (validFiles.length === 0) {
      notify(
        "error",
        "No supported images found to convert"
      );
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  /* ================= CONVERT ================= */
  const convertNow = async () => {
    if (files.length === 0) {
      notify("warning", "Please upload at least one image");
      return;
    }

    try {
      start("Converting images to PDF...");
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) =>
        formData.append("files", file)
      );

      const blob = await postFile(
        "image-to-pdf",
        formData
      );

      finish();
      setResultUrl(URL.createObjectURL(blob));
      notify(
        "success",
        "Images converted to PDF successfully 🎉"
      );
    } catch (err) {
      stop();
      notify(
        "error",
        err?.message || "Image to PDF conversion failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET ================= */
  const reset = () => {
    setFiles([]);
    setResultUrl(null);
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        {/* Title */}
        <title>
          Image to PDF Converter Online – JPG, PNG, WEBP to PDF | ConvertZip
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Convert images to PDF online for free with ConvertZip. Combine JPG, PNG, and WEBP images into a single high-quality PDF. Fast, secure, no signup required."
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Image to PDF Converter Online – JPG, PNG, WEBP to PDF | ConvertZip"
        />
        <meta
          property="og:description"
          content="Convert JPG, PNG, and WEBP images to PDF online for free. Combine multiple images into one PDF using ConvertZip."
        />
        <meta
          property="og:url"
          content={window.location.href}
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta property="og:image" content="https://convertzip.com/og/images-to-pdf.png" />
      </Helmet>


      <ToolLayout
        title="Images to PDF Converter Online"
        description="Images to PDF converter online to convert JPG, PNG, and WEBP images into a single PDF file easily.">

        <ProcessingOverlay
          visible={visible}
          progress={progress}
          text={text}
        />

        {/* UPLOAD */}
        {files.length === 0 && !resultUrl && !visible && (
          <UploadBox
            accept="image/*"
            multiple
            label="Select images (JPG, PNG, WEBP)"
            onFiles={addFiles}
          />
        )}

        {/* FILE LIST */}
        {files.length > 0 && !resultUrl && !visible && (
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <button
                onClick={() =>
                  document.getElementById("addMoreImages").click()
                }
                className="text-blue-600 font-medium"
              >
                ➕ Add more images
              </button>

              <button
                onClick={convertNow}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Converting..." : "Convert →"}
              </button>

              <input
                id="addMoreImages"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) =>
                  addFiles([...e.target.files])
                }
              />
            </div>

            <FileList
              files={files}
              onRemove={(i) =>
                setFiles(files.filter((_, idx) => idx !== i))
              }
            />
          </div>
        )}

        {/* RESULT */}
        {resultUrl && (
          <ResultPanel
            fileUrl={resultUrl}
            fileName="images.pdf"
            onReset={reset}
          />
        )}
      </ToolLayout>
    </>
  );
}
