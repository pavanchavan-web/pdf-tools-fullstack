import { useState, useEffect } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ImageResultPreview from "../components/ImageResultPreview";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function PdfImageExtractor() {
  const [file, setFile] = useState(null);
  const [zipBlob, setZipBlob] = useState(null);

  // 🔥 Progress system (SAME as Split & Compress)
  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  // ✅ AUTO extract when file is selected
  useEffect(() => {
    if (!file) return;

    const extract = async () => {
      start("Extracting images from PDF...");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const blob = await postFile("pdf-image-extract", formData);
        finish(); // 🔥 animate to 100%
        setZipBlob(blob);
      } catch (err) {
        stop();
        alert("Image extraction failed");
        setFile(null);
      }
    };

    extract();
  }, [file]);

  const reset = () => {
    setFile(null);
    setZipBlob(null);
  };

  return (
    <ToolLayout
      title="Extract Images from PDF"
      description="Automatically extract all images from a PDF file"
    >
      {/* 🔄 Progress Overlay */}
      <ProcessingOverlay
        visible={visible}
        progress={progress}
        text={text}
      />

      {/* Upload screen */}
      {!zipBlob && !visible && (
        <UploadBox
          accept="application/pdf"
          multiple={false}
          onFiles={(files) => setFile(files[0])}
        />
      )}

      {/* Result screen */}
      {zipBlob && (
        <>
          <ImageResultPreview zipBlob={zipBlob} />

          <div className="mt-6 flex justify-center gap-4">
            <a
              href={URL.createObjectURL(zipBlob)}
              download="pdf-images.zip"
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              ⬇️ Download ZIP
            </a>

            <button
              onClick={reset}
              className="border px-6 py-3 rounded-lg"
            >
              🔄 Extract more
            </button>
          </div>
        </>
      )}
    </ToolLayout>
  );
}
