import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

const MAX_FILES = 30;
const MAX_TOTAL_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

export default function ImageToPdf() {
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
      alert(`Maximum ${MAX_FILES} images allowed`);
      return false;
    }

    const invalid = incoming.find(
      (f) => !f.type.startsWith("image/")
    );
    if (invalid) {
      alert("Only image files are allowed");
      return false;
    }

    const totalSize = incoming.reduce(
      (sum, f) => sum + f.size,
      0
    );
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("Total file size exceeds 1GB limit");
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

  /* ================= CONVERT ================= */
  const convertNow = async () => {
    if (files.length === 0) return;

    try {
      start("Converting images to PDF...");
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const blob = await postFile("image-to-pdf", formData);
      const url = URL.createObjectURL(blob);

      finish();
      setResultUrl(url);
    } catch (err) {
      stop();
      alert(err.message || "Conversion failed");
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
    <ToolLayout
      title="Image to PDF"
      description="Convert up to 30 images into a single PDF (Max 1GB)"
    >
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
          label="Select images (Max 30 • Total 1GB)"
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
  );
}
