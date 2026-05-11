import { useState } from "react";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import PdfEditor from "../components/PdfEditor";

export default function EditPdf() {
  // =====================================================
  // STATES
  // =====================================================

  const [file, setFile] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // HANDLE FILES
  // =====================================================

  const handleFiles = async (
    files
  ) => {
    try {
      setLoading(true);

      const selectedFile =
        files?.[0];

      if (!selectedFile) {
        return;
      }

      // =====================================================
      // VALIDATE FILE TYPE
      // =====================================================

      const isPdf =
        selectedFile.type ===
          "application/pdf" ||
        selectedFile.name
          ?.toLowerCase()
          .endsWith(".pdf");

      if (!isPdf) {
        setError(
          "Please upload a valid PDF file."
        );

        return;
      }

      // =====================================================
      // VALIDATE FILE SIZE
      // =====================================================

      const MAX_SIZE =
        100 * 1024 * 1024;

      if (
        selectedFile.size >
        MAX_SIZE
      ) {
        setError(
          "Maximum PDF size is 100MB."
        );

        return;
      }

      // =====================================================
      // CLEAR ERRORS
      // =====================================================

      setError("");

      // =====================================================
      // SET FILE
      // =====================================================

      setFile(selectedFile);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load PDF file."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE FILE
  // =====================================================

  const handleChangeFile = () => {
    setFile(null);

    setError("");

    setLoading(false);
  };

  // =====================================================
  // UPLOAD SCREEN
  // =====================================================

  if (!file) {
    return (
      <ToolLayout
        title="Edit PDF Online"
        description="Edit PDF text online while preserving original fonts, bold text, colors, alignment, and layout."
      >
        <div className="flex justify-center items-center min-h-[60vh] px-4 py-10">
          <div className="w-full max-w-3xl">
            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =====================================================
                UPLOAD BOX
            ===================================================== */}

            <UploadBox
              accept="application/pdf"
              multiple={false}
              label={
                loading
                  ? "Loading PDF..."
                  : "Select PDF file"
              }
              onFiles={handleFiles}
            />

            {/* =====================================================
                FEATURES
            ===================================================== */}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD */}

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Preserve Fonts
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  Automatically preserve original PDF fonts, bold styles, and layout while editing text.
                </p>
              </div>

              {/* CARD */}

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Advanced Styling
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  Edit font size, color, underline, alignment, and typography without breaking the PDF design.
                </p>
              </div>

              {/* CARD */}

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Secure Processing
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  Files are securely processed and temporary PDF uploads are automatically removed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ToolLayout>
    );
  }

  // =====================================================
  // FULLSCREEN EDITOR
  // =====================================================

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-100">
      <PdfEditor
        file={file}
        onChangeFile={
          handleChangeFile
        }
      />
    </div>
  );
}