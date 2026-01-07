import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import ActionButton from "../components/ActionButton";
import ResultPanel from "../components/ResultPanel";
import { postFile } from "../utils/api";

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const handleConvert = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const blob = await postFile("image-to-pdf", formData);
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
    } catch {
      alert("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResultUrl(null);
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert JPG or PNG images into a PDF"
    >
      {!resultUrl && (
        <>
          <UploadBox
            accept="image/*"
            multiple
            label="Select images"
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
            label={loading ? "Converting..." : "Convert to PDF"}
            disabled={files.length === 0 || loading}
            onClick={handleConvert}
          />
        </>
      )}

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
