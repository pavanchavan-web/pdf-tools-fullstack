import { useEffect, useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import SplitResultPreview from "../components/SplitResultPreview";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [zipBlob, setZipBlob] = useState(null);

  // 🔥 Progress system
  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  // 🔥 AUTO SPLIT when file is uploaded
  useEffect(() => {
    if (!file) return;

    const split = async () => {
      start("Splitting PDF pages...");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const blob = await postFile("split", formData);
        finish(); // animate to 100%
        setZipBlob(blob);
      } catch (err) {
        stop();
        alert("Split failed");
        setFile(null);
      }
    };

    split();
  }, [file]);

  const reset = () => {
    setFile(null);
    setZipBlob(null);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Split PDF into individual pages automatically"
    >
      {/* 🔄 Progress Overlay */}
      <ProcessingOverlay
        visible={visible}
        progress={progress}
        text={text}
      />

      {/* Upload */}
      {!zipBlob && !visible && (
        <UploadBox
          accept="application/pdf"
          multiple={false}
          label="Select PDF file"
          onFiles={(files) => setFile(files[0])}
        />
      )}

      {/* Result */}
      {zipBlob && (
        <>
          <SplitResultPreview zipBlob={zipBlob} />

          <div className="mt-6 flex justify-center gap-4">
            <a
              href={URL.createObjectURL(zipBlob)}
              download="split-pages.zip"
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              ⬇️ Download ZIP
            </a>

            <button
              onClick={reset}
              className="border px-6 py-3 rounded-lg"
            >
              🔄 Process another file
            </button>
          </div>
        </>
      )}
    </ToolLayout>
  );
}
