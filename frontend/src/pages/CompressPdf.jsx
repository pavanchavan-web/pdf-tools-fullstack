import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

export default function CompressPdf() {
  /* ================= SEO ================= */
  const pageTitle =
    "Compress PDF Online – Reduce PDF File Size Free";

  const pageDesc =
    "Compress PDF files online for free. Reduce PDF file size without losing quality. Fast, secure PDF compressor with no signup required.";

  const pageKeywords =
    "compress pdf, compress pdf document, pdfcompress, pdf to pdf compress, compress pdf to pdf, compress pdf doc, compress compressed pdf, compress data pdf, compress into pdf, compressor compress pdf, hipdf compress, pdf compress pdf, pdf compressor pdf, pdf pdf compressor, pdf to compressedf";

  /* ================= STATE ================= */
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
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} key="description" />
        <meta name="keywords" content={pageKeywords} key="keywords" />
      </Helmet>

      {/* ================= TOOL ================= */}
      <ToolLayout 
      title="Compress PDF Online" 
      description="Compress PDF online to reduce PDF file size without losing quality. Fast, secure, and free PDF compression tool.">

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
    </>
  );
}
