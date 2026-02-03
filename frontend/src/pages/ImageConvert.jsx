import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";

import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ImageResultPreview from "../components/ImageResultPreview";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";
import { useNotify } from "../context/NotificationContext";

const OUTPUT_FORMATS = [
  "jpeg",
  "png",
  "webp",
  "avif",
  "bmp",
  "gif",
  "tiff",
  "svg",
];

const MAX_IMAGES = 20;
const MAX_SIZE_MB = 20;

export default function ImageConvert({
  targetFormat = "jpeg",
  title,
  desc,
  maxText = "Max 20 images per upload.",
}) {
  /* ================= STATE ================= */
  const [items, setItems] = useState([]);
  const [commonOutput, setCommonOutput] = useState(targetFormat);
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const { notify } = useNotify();
  const { visible, progress, text, start, finish, stop } = useProgress();

  /* ================= ADD FILES ================= */
  const addFiles = (files) => {
    if (items.length + files.length > MAX_IMAGES) {
      notify("warning", "Maximum 20 images allowed per upload");
      return;
    }

    const oversized = files.find(
      (f) => f.size > MAX_SIZE_MB * 1024 * 1024
    );

    if (oversized) {
      notify(
        "error",
        `File "${oversized.name}" exceeds ${MAX_SIZE_MB}MB limit`
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        file: f,
        output: commonOutput,
      })),
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ================= OUTPUT ================= */
  const updateOutput = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, output: value } : item
      )
    );
  };

  const applyCommonOutput = (value) => {
    setCommonOutput(value);
    setItems((prev) => prev.map((i) => ({ ...i, output: value })));
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= CONVERT ================= */
  const handleConvert = async () => {
    if (items.length === 0) {
      notify("warning", "Please upload at least one image");
      return;
    }

    start("Converting images...");
    setLoading(true);

    try {
      const formData = new FormData();
      items.forEach((i) => formData.append("files", i.file));
      formData.append(
        "formats",
        JSON.stringify(items.map((i) => i.output))
      );

      const blob = await postFile("image-convert", formData);

      // ✅ ALWAYS SHOW RESULT if ZIP exists
      setZipBlob(blob);
      finish();

      notify(
        "success",
        "Conversion completed. Some unsupported images may have been skipped."
      );
    } catch (err) {
      stop();

      // ❌ Only show error if NOTHING was converted
      notify(
        "error",
        "Conversion failed for all images. Please try a different format."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setItems([]);
    setZipBlob(null);
    setCommonOutput(targetFormat);
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        {/* Title */}
        <title>
          Image Converter Online – JPEG, PNG, WEBP, AVIF, SVG, GIF, TIFF | ConvertZip
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Convert images online for free with ConvertZip. Convert JPG, PNG, WEBP, AVIF, BMP, GIF, SVG, and TIFF files instantly. Fast & secure."
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Image Converter Online – JPEG, PNG, WEBP, AVIF, SVG, GIF, TIFF | ConvertZip"
        />
        <meta
          property="og:description"
          content="Free online image converter supporting JPG, PNG, WEBP, AVIF, BMP, GIF, SVG & TIFF formats."
        />
        <meta
          property="og:url"
          content={window.location.href}
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>

      {/* ================= TOOL LAYOUT ================= */}
      <ToolLayout
        title="Image Converter Online"
        description="Image converter online to convert JPG, PNG, WEBP, and AVIF images into your desired format easily.">

        <ProcessingOverlay visible={visible} progress={progress} text={text} />

        {items.length === 0 && !zipBlob && !visible && (
          <UploadBox
            accept="image/*"
            multiple
            maxText={maxText}
            onFiles={addFiles}
          />
        )}

        {items.length > 0 && !zipBlob && !visible && (
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-medium"
              >
                ➕ Add more images
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles([...e.target.files])}
              />

              <select
                value={commonOutput}
                onChange={(e) => applyCommonOutput(e.target.value)}
                className="border rounded px-3 py-2 font-medium"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-b"
              >
                <div>
                  <div className="font-medium text-sm">
                    {item.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(item.file.size / 1024).toFixed(2)} KB
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={item.output}
                    onChange={(e) =>
                      updateOutput(i, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {OUTPUT_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between px-4 py-4 bg-gray-50">
              <span className="text-sm">
                Convert {items.length} / {MAX_IMAGES} images
              </span>

              <button
                onClick={handleConvert}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Converting..." : "Convert →"}
              </button>
            </div>
          </div>
        )}

        {zipBlob && (
          <>
            <ImageResultPreview zipBlob={zipBlob} />

            <div className="mt-6 flex justify-center gap-4">
              <a
                href={URL.createObjectURL(zipBlob)}
                download="converted-images.zip"
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                ⬇️ Download ZIP
              </a>

              <button
                onClick={reset}
                className="border px-6 py-3 rounded-lg"
              >
                🔄 Convert more images
              </button>
            </div>
          </>
        )}
      </ToolLayout>
    </>
  );
}
