import { useEffect, useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);

  // 🔥 Progress system (same as SplitPdf)
  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  // 🔥 AUTO COMPRESS when file is uploaded
  useEffect(() => {
    if (!file) return;

    const compressPdf = async () => {
      start("Compressing PDF...");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const blob = await postFile("compress", formData);
        const url = URL.createObjectURL(blob);

        finish(); // 🔥 animate to 100%
        setResultUrl(url);
      } catch (err) {
        stop();
        alert("Compression failed");
        setFile(null);
      }
    };

    compressPdf();
  }, [file]);

  const reset = () => {
    setFile(null);
    setResultUrl(null);
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size easily and automatically"
    >
      {/* 🔄 Progress Overlay */}
      <ProcessingOverlay
        visible={visible}
        progress={progress}
        text={text}
      />

      {/* Upload screen */}
      {!resultUrl && !visible && (
        <UploadBox
          accept="application/pdf"
          multiple={false}
          label="Select PDF file"
          onFiles={(files) => setFile(files[0])}
        />
      )}

      {/* Result screen */}
      {resultUrl && (
        <ResultPanel
          fileUrl={resultUrl}
          fileName="compressed.pdf"
          onReset={reset}
        />
      )}
    </ToolLayout>
  );
}
