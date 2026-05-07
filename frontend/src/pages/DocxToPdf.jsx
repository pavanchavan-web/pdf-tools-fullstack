import "../index.css";

import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import JSZip from "jszip";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ProcessingOverlay from "../components/ProcessingOverlay";

import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";
import { useNotify } from "../context/NotificationContext";

const MAX_FILES = 5;
const MAX_SIZE_MB = 500;

export default function DocxToPdf() {

  /* ================= STATE ================= */

  const [items, setItems] = useState([]);

  const [zipBlob, setZipBlob] =
    useState(null);

  const [pdfFiles, setPdfFiles] =
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

    const validFiles = files.filter(
      (f) =>
        f.name.endsWith(".docx") ||
        f.name.endsWith(".doc")
    );

    if (validFiles.length !== files.length) {

      notify(
        "warning",
        "Only DOC/DOCX files are accepted"
      );

    }

    if (
      items.length + validFiles.length >
      MAX_FILES
    ) {

      notify(
        "warning",
        `Maximum ${MAX_FILES} DOCX files allowed`
      );

      return;
    }

    const oversized = validFiles.find(
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
      ...validFiles,
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
        "Please upload at least one DOCX"
      );

      return;
    }

    start("Converting DOCX to PDF...");

    setLoading(true);

    try {

      const formData = new FormData();

      items.forEach((file) => {
        formData.append("files", file);
      });

      const blob = await postFile(
        "docx-to-pdf",
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
                    type: "application/pdf",
                  })
                );

              return {
                name,
                url,
              };

            })

        );

      setZipBlob(blob);

      setPdfFiles(extracted);

      finish();

      notify(
        "success",
        `${extracted.length} PDF file(s) converted successfully!`
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

    pdfFiles.forEach((f) => {
      URL.revokeObjectURL(f.url);
    });

    setItems([]);

    setZipBlob(null);

    setPdfFiles([]);

  };

  /* ================= UI ================= */

  return (
    <>
      <Helmet>

        <title>
          Convert DOCX to PDF Online |
          ConvertZip
        </title>

        <meta
          name="description"
          content="Convert Word DOCX files into PDF online for free."
        />

      </Helmet>

      <ToolLayout
        title="DOCX to PDF Converter"
        description="Convert Word DOCX documents into PDF files online for free."
      >

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
              accept=".doc,.docx"
              multiple
              maxText={`Max ${MAX_FILES} DOCX files · Up to ${MAX_SIZE_MB}MB each`}
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
                  ➕ Add more DOCX
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx"
                  multiple
                  hidden
                  onChange={(e) =>
                    addFiles([
                      ...e.target.files,
                    ])
                  }
                />

                <span className="text-sm text-gray-500">
                  {items.length} / {MAX_FILES} files
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

                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        DOCX
                      </div>

                      <div>

                        <div className="font-medium text-sm truncate max-w-[240px] text-left">
                          {file.name}
                        </div>

                        <div className="text-xs text-blue-500 text-left">
                          {(file.size / 1024).toFixed(
                            1
                          )}{" "}
                          KB → PDF
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
                    : ""} ready
                </span>

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading
                    ? "Converting..."
                    : "Convert to PDF →"}
                </button>

              </div>
            </div>

          )}

        {/* ================= SCREEN 3 ================= */}

        {zipBlob &&
          pdfFiles.length > 0 && (

            <>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

                <div className="p-4 border-b bg-green-50 flex items-center gap-2">

                  <span className="text-green-700 font-semibold">
                    ✅ {pdfFiles.length} file
                    {pdfFiles.length > 1
                      ? "s"
                      : ""} converted successfully
                  </span>

                </div>

                {pdfFiles.map((pdf, i) => (

                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 px-4 py-5 border-b last:border-b-0"
                  >

                    <div className="flex items-center gap-4 min-w-0">

                      {/* PDF Card */}

                      <div className="flex flex-col items-center justify-center flex-shrink-0">

                        <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          PDF
                        </div>

                        <div className="text-[10px] text-gray-500 font-medium">
                          PDF File
                        </div>

                      </div>

                      {/* File Info */}

                      <div className="min-w-0">

                        <div className="font-semibold text-sm truncate max-w-[260px]">
                          {pdf.name}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 text-left">
                          Converted PDF Document
                        </div>

                      </div>
                    </div>

                    {/* Download */}

                    <a
                      href={pdf.url}
                      download={pdf.name}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Download
                    </a>

                  </div>

                ))}
              </div>

              {/* Bottom Buttons */}

              <div className="mt-6 flex flex-wrap justify-center gap-4">

                <a
                  href={URL.createObjectURL(
                    zipBlob
                  )}
                  download="docx-to-pdf.zip"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ⬇️ Download ZIP
                </a>

                <button
                  onClick={reset}
                  className="border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🔄 Convert More DOCX
                </button>

              </div>
            </>
          )}

      </ToolLayout>
    </>
  );
}