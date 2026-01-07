import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import ActionButton from "../components/ActionButton";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  // 🔥 Progress system (ADDED)
  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  const handleMerge = async () => {
    try {
      start("Merging PDF files...");
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const blob = await postFile("merge", formData);
      const url = URL.createObjectURL(blob);

      finish(); // 🔥 animate to 100%
      setResultUrl(url);
    } catch {
      stop();
      alert("Merge failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResultUrl(null);
  };

  return (
    <ToolLayout title="Merge PDF" description="Combine multiple PDFs into one">
      {/* 🔄 Progress Overlay (ADDED) */}
      <ProcessingOverlay
        visible={visible}
        progress={progress}
        text={text}
      />

      {!resultUrl && !visible && (
        <>
          <UploadBox
            accept="application/pdf"
            multiple
            label="Select PDF files"
            onFiles={(files) => setFiles(files)}
          />

          {files.length > 0 && (
            <FileList
              files={files}
              onRemove={(i) =>
                setFiles(files.filter((_, idx) => idx !== i))
              }
            />
          )}

          <ActionButton
            label={loading ? "Merging..." : "Merge PDF"}
            disabled={files.length < 2 || loading}
            onClick={handleMerge}
          />
        </>
      )}

      {resultUrl && (
        <ResultPanel
          fileUrl={resultUrl}
          fileName="merged.pdf"
          onReset={reset}
        />
      )}
    </ToolLayout>
  );
}
