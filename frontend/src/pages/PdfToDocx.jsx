// src/pages/PdfToDocx.jsx

import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import JSZip from "jszip";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ProcessingOverlay from "../components/ProcessingOverlay";
import PdfPagePreview from "../components/PdfPagePreview";

import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";
import { useNotify } from "../context/NotificationContext";

const MAX_FILES = 5;
const MAX_SIZE_MB = 50;

export default function PdfToDocx() {

  /* ================= STATE ================= */

  const [items, setItems] = useState([]);

  const [zipBlob, setZipBlob] =
    useState(null);

  const [docxFiles, setDocxFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const fileInputRef = useRef(null);

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

  const addFiles = (files) => {

    const pdfs = files.filter(
      (f) => f.type === "application/pdf"
    );

    if (pdfs.length !== files.length) {

      notify(
        "warning",
        "Only PDF files are accepted"
      );

    }

    if (
      items.length + pdfs.length >
      MAX_FILES
    ) {

      notify(
        "warning",
        `Maximum ${MAX_FILES} PDFs allowed`
      );

      return;
    }

    const oversized = pdfs.find(
      (f) =>
        f.size >
        MAX_SIZE_MB * 1024 * 1024
    );

    if (oversized) {

      notify(
        "error",
        `"${oversized.name}" exceeds ${MAX_SIZE_MB}MB limit`
      );

      return;
    }

    setItems((prev) => [
      ...prev,
      ...pdfs,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ================= REMOVE ================= */

  const removeItem = (index) => {

    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );

  };

  /* ================= CONVERT ================= */

  const handleConvert = async () => {

    if (items.length === 0) {

      notify(
        "warning",
        "Please upload at least one PDF"
      );

      return;
    }

    start("Converting PDFs to DOCX...");

    setLoading(true);

    try {

      const formData = new FormData();

      items.forEach((file) => {
        formData.append("files", file);
      });

      const blob = await postFile(
        "pdf-to-docx",
        formData
      );

      const zip =
        await JSZip.loadAsync(blob);

      const extracted =
        await Promise.all(

          Object.keys(zip.files)
            .filter(
              (name) =>
                !zip.files[name].dir
            )
            .map(async (name) => {

              const fileData =
                await zip.files[name].async(
                  "blob"
                );

              const url =
                URL.createObjectURL(
                  new Blob([fileData], {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  })
                );

              return {
                name,
                url,
              };

            })

        );

      setZipBlob(blob);

      setDocxFiles(extracted);

      finish();

      notify(
        "success",
        `${extracted.length} file(s) converted successfully!`
      );

    } catch (err) {

      console.error(err);

      stop();

      notify(
        "error",
        "Conversion failed. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  /* ================= RESET ================= */

  const reset = () => {

    docxFiles.forEach((f) => {
      URL.revokeObjectURL(f.url);
    });

    setItems([]);

    setZipBlob(null);

    setDocxFiles([]);

  };

  /* ================= UI ================= */

  return (
    <>
      {/* ================= SEO ================= */}

      <Helmet>

        <title>
          Convert PDF to DOCX Online –
          Free PDF to Word | ConvertZip
        </title>

        <meta
          name="description"
          content="Convert PDF to editable Word DOCX online for free."
        />

      </Helmet>

      {/* ================= LAYOUT ================= */}

      <ToolLayout
        title="PDF to DOCX Converter"
        description="Convert PDF files into editable Word DOCX documents online for free."
      >

        {/* ================= PROCESSING ================= */}

        <ProcessingOverlay
          visible={visible}
          progress={progress}
          text={text}
        />

        {/* ================= SCREEN 1 ================= */}

        {items.length === 0 &&
          !zipBlob &&
          !visible && (

            <UploadBox
              accept="application/pdf"
              multiple
              maxText={`Max ${MAX_FILES} PDFs · Up to ${MAX_SIZE_MB}MB each`}
              onFiles={addFiles}
            />

          )}

        {/* ================= SCREEN 2 ================= */}

        {items.length > 0 &&
          !zipBlob &&
          !visible && (

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

              {/* Header */}

              <div className="p-4 border-b flex items-center justify-between">

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  ➕ Add more PDFs
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) =>
                    addFiles([
                      ...e.target.files,
                    ])
                  }
                />

                <span className="text-sm text-gray-500">
                  {items.length} / {MAX_FILES} PDFs
                </span>

              </div>

              {/* File List */}

              <div className="divide-y">

                {items.map((file, i) => (

                  <div
                    key={i}
                    className="flex items-center justify-between p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                        PDF
                      </div>

                      <div>

                        <div className="font-medium text-sm truncate max-w-[240px]">
                          {file.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(
                            1
                          )}{" "}
                          KB → DOCX
                        </div>

                      </div>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(i)
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>

                  </div>

                ))}

              </div>

              {/* Footer */}

              <div className="flex items-center justify-between px-4 py-4 bg-gray-50">

                <span className="text-sm text-gray-500">
                  {items.length} file
                  {items.length > 1
                    ? "s"
                    : ""}{" "}
                  ready
                </span>

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading
                    ? "Converting..."
                    : "Convert to DOCX →"}
                </button>

              </div>
            </div>

          )}

        {/* ================= SCREEN 3 ================= */}

        {zipBlob &&
          docxFiles.length > 0 && (

            <>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

                {/* Header */}

                <div className="p-4 border-b bg-green-50 flex items-center gap-2">

                  <span className="text-green-700 font-semibold">
                    ✅ {docxFiles.length} file
                    {docxFiles.length > 1
                      ? "s"
                      : ""}{" "}
                    converted successfully
                  </span>

                </div>

                {/* Result Cards */}

                {docxFiles.map((docx, i) => {

                  const originalPdf =
                    items[i];

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 px-4 py-5 border-b last:border-b-0"
                    >

                      {/* LEFT */}

                      <div className="flex items-center gap-4 min-w-0">

                        {/* Preview */}

                        <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">

                          {originalPdf ? (

                            <PdfPagePreview
                              file={originalPdf}
                              singlePage
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              DOCX
                            </div>

                          )}

                        </div>

                        {/* Info */}

                        <div className="min-w-0">

                          <div className="font-semibold text-sm truncate">
                            {docx.name}
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            Word Document
                          </div>

                        </div>
                      </div>

                      {/* Download */}

                      <a
                        href={docx.url}
                        download={docx.name}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        ⬇ Download
                      </a>

                    </div>
                  );
                })}
              </div>

              {/* Bottom Buttons */}

              <div className="mt-6 flex flex-wrap justify-center gap-4">

                <a
                  href={URL.createObjectURL(
                    zipBlob
                  )}
                  download="pdf-to-docx.zip"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ⬇️ Download ZIP
                </a>

                <button
                  onClick={reset}
                  className="border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🔄 Convert More PDFs
                </button>

              </div>
            </>
          )}

      </ToolLayout>
    </>
  );
}