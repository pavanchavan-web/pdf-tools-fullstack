import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import SplitResultPreview from "../components/SplitResultPreview";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function SplitPdf() {
  /* ================= STATE ================= */
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
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        {/* Title */}
        <title>
          Split PDF Online – Separate PDF Pages Free | ConvertZip
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Split PDF files online for free with ConvertZip. Separate PDF pages into individual files instantly. Fast, secure PDF splitter with no signup required."
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Split PDF Online – Separate PDF Pages Free | ConvertZip"
        />
        <meta
          property="og:description"
          content="Split PDF documents into separate pages online for free using ConvertZip. Fast, secure, and easy to use."
        />
        <meta
          property="og:url"
          content={window.location.href}
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta property="og:image" content="https://convertzip.com/og/split-pdf.png" />
      </Helmet>


      {/* ================= TOOL ================= */}
      <ToolLayout
        title="Split PDF Online"
        description="Turn any PDF into separate files by extracting single pages or splitting the whole document.">

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
    </>
  );
}
