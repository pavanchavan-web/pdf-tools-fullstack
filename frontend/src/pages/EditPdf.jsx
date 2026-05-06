import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import PdfEditor from "../components/PdfEditor";

export default function EditPdf() {
  const [file, setFile] = useState(null);

  // =========================
  // UPLOAD MODE (WITH TOOL LAYOUT)
  // =========================
  if (!file) {
    return (
      <ToolLayout
        title="Edit PDF Online"
        description="Edit text in PDF files online without changing fonts, layout, or design."
      >
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-full max-w-3xl">
            <UploadBox
              accept="application/pdf"
              multiple={false}
              label="Select PDF file"
              onFiles={(files) => setFile(files[0])}
            />
          </div>
        </div>
      </ToolLayout>
    );
  }

  // =========================
  // EDITOR MODE (FULL SCREEN, NO TOOL LAYOUT)
  // =========================
  return (
    <div className="fixed inset-0 bg-gray-100">
      <PdfEditor
        file={file}
        onChangeFile={() => setFile(null)}
      />
    </div>
  );
}
