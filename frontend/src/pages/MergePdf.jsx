import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export default function MergePdf() {
  /* ================= SEO ================= */
  const pageTitle =
    "Merge PDF Online – Combine PDF Files Free & Secure";

  const pageDesc =
    "Select multiple PDF files and merge them in seconds. Merge & combine PDF files online easily, fast, and free — no signup required.";

  const pageKeywords =
    "merge pdf, combine pdf,merge pdf online, merge pdf documents, pdf to pdf merge, merge pdf documents online, pdf concatenate online, pdf splitter software, merge all pdfs, combine pdf combine, merge pdf and pdf, merge pdf to pdf online, pdf merge software online, pdf to pdf merge online";

  /* ================= STATE ================= */
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  /* ================= VALIDATION ================= */
  const validateFiles = (incoming) => {
    if (incoming.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} PDF files allowed`);
      return false;
    }

    const nonPdf = incoming.find(
      (f) => f.type !== "application/pdf"
    );
    if (nonPdf) {
      alert("Only PDF files are allowed");
      return false;
    }

    const totalSize = incoming.reduce(
      (sum, f) => sum + f.size,
      0
    );
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("Total file size exceeds 2GB limit");
      return false;
    }

    return true;
  };

  /* ================= ADD FILES ================= */
  const addFiles = (newFiles) => {
    const merged = [...files, ...newFiles];

    if (!validateFiles(merged)) return;

    setFiles(merged);
  };

  /* ================= AUTO MERGE ================= */
  const mergeNow = async () => {
    if (files.length < 2) return;

    try {
      start("Merging PDF files...");
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const blob = await postFile("merge", formData);
      const url = URL.createObjectURL(blob);

      finish();
      setResultUrl(url);
    } catch (err) {
      stop();
      alert(err.message || "Merge failed");
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
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} key="description" />
        <meta name="keywords" content={pageKeywords} key="keywords" />
      </Helmet>

      {/* ================= TOOL ================= */}
      <ToolLayout title={pageTitle} description={pageDesc}>
        
        <ProcessingOverlay
          visible={visible}
          progress={progress}
          text={text}
        />

        {/* UPLOAD */}
        {files.length === 0 && !resultUrl && !visible && (
          <UploadBox
            accept="application/pdf"
            multiple
            label="Select PDF files (Max 5 • Total 2GB)"
            onFiles={addFiles}
          />
        )}

        {/* FILE LIST PAGE */}
        {files.length > 0 && !resultUrl && !visible && (
          <div className="bg-white rounded-xl border shadow-sm">
            {/* TOP BAR */}
            <div className="p-4 border-b flex justify-between items-center">
              <button
                onClick={() =>
                  document.getElementById("addMorePdf").click()
                }
                className="text-blue-600 font-medium"
              >
                ➕ Add more files
              </button>

              <button
                onClick={mergeNow}
                disabled={loading || files.length < 2}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Merging..." : "Merge →"}
              </button>

              <input
                id="addMorePdf"
                type="file"
                accept="application/pdf"
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
            fileName="merged.pdf"
            onReset={reset}
          />
        )}
      </ToolLayout>
    </>
  );
}
