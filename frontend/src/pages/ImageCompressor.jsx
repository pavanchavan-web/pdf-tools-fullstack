import { useEffect, useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ImageResultPreview from "../components/ImageResultPreview";
import BeforeAfterCompare from "../components/BeforeAfterCompare";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";
import { useNotify } from "../context/NotificationContext";

const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024; // 1GB

export default function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  const [quality, setQuality] = useState(80); // ✅ better default
  const [format, setFormat] = useState("webp");
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [beforeSrc, setBeforeSrc] = useState(null);
  const [afterSrc, setAfterSrc] = useState(null);

  const { notify } = useNotify();
  const { visible, progress, text, start, finish, stop } = useProgress();

  /* -------------------------------
     Preview update
  --------------------------------*/
  useEffect(() => {
    if (!files.length) return;

    const file = files[activeIndex];
    const url = URL.createObjectURL(file);

    setBeforeSrc(url);
    setAfterSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [files, activeIndex, quality, format, keepOriginal]);

  /* -------------------------------
     Helpers
  --------------------------------*/
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  const addFiles = (newFiles) => {
    if (files.length + newFiles.length > MAX_FILES) {
      notify("warning", "Maximum 20 images allowed");
      return;
    }

    if (
      totalSize + newFiles.reduce((s, f) => s + f.size, 0) >
      MAX_TOTAL_SIZE
    ) {
      notify("error", "Total upload size exceeds 1GB");
      return;
    }

    const unsupported = newFiles.filter((f) => f.type === "image/bmp");
    if (unsupported.length) {
      notify(
        "warning",
        `${unsupported.length} BMP image(s) will be skipped automatically`
      );
    }

    const supported = newFiles.filter((f) => f.type !== "image/bmp");
    if (!supported.length) {
      notify("error", "No supported images to compress");
      return;
    }

    setFiles((prev) => [...prev, ...supported]);
  };

  /* -------------------------------
     Compress
  --------------------------------*/
  const compress = async () => {
    if (!files.length) {
      notify("warning", "Please upload at least one image");
      return;
    }

    start("Compressing images...");
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      formData.append("quality", quality);
      formData.append("format", format); // ✅ real format only
      formData.append("keepOriginal", keepOriginal); // ✅ boolean

      const blob = await postFile("image-compress", formData);

      finish();
      setZipBlob(blob);

      notify(
        "success",
        `Compressed ${files.length} image(s) successfully 🎉`
      );
    } catch (err) {
      stop();
      notify("error", err?.message || "Image compression failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setZipBlob(null);
    setActiveIndex(0);
    setBeforeSrc(null);
    setAfterSrc(null);
    setQuality(80);
    setFormat("webp");
    setKeepOriginal(false);
  };

  const originalSizeKB = files[activeIndex]
    ? Math.round(files[activeIndex].size / 1024)
    : 0;

  const previewSizeKB = Math.max(
    10,
    Math.round(originalSizeKB * (quality / 100))
  );

  const savedPercent =
    originalSizeKB > 0
      ? 100 - Math.round((previewSizeKB / originalSizeKB) * 100)
      : 0;

  return (
    <ToolLayout
      title="AI Image Compressor"
      description="Compress images intelligently with live preview and quality control"
    >
      <ProcessingOverlay visible={visible} progress={progress} text={text} />

      {!files.length && !zipBlob && !visible && (
        <UploadBox
          accept="image/*"
          multiple
          maxText="Max 20 images, 1GB total. BMP will be skipped."
          onFiles={addFiles}
        />
      )}

      {!zipBlob && files.length > 0 && !visible && (
        <>
          <h3 className="text-center font-medium mb-2">
            {files[activeIndex]?.name}
          </h3>

          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Original: {originalSizeKB} KB</span>
            <span>
              Preview: ~{previewSizeKB} KB ({savedPercent}%)
            </span>
          </div>

          {beforeSrc && afterSrc && (
            <BeforeAfterCompare before={beforeSrc} after={afterSrc} />
          )}

          <div className="flex gap-3 overflow-x-auto mt-6 mb-4">
            {files.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                onClick={() => setActiveIndex(i)}
                className={`h-20 cursor-pointer rounded border ${
                  i === activeIndex ? "ring-2 ring-indigo-500" : ""
                }`}
                alt="thumb"
              />
            ))}
          </div>

          <div className="bg-white border rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div>
                <label className="block text-sm mb-1">Format</label>
                <select
                  value={format}
                  disabled={keepOriginal}
                  onChange={(e) => setFormat(e.target.value)}
                  className="border px-3 py-2 rounded disabled:bg-gray-100"
                >
                  <option value="webp">WEBP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="avif">AVIF</option>
                  <option value="png">PNG</option>
                </select>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={keepOriginal}
                    onChange={(e) => setKeepOriginal(e.target.checked)}
                  />
                  <span className="text-sm">Keep original format</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quality</span>
                <input
                  type="range"
                  min="20"   // ✅ FIXED
                  max="99"   // ✅ FIXED
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-56 accent-indigo-600"
                />
                <span className="border px-3 py-1 rounded text-sm font-medium">
                  {quality}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={compress}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg"
            >
              {loading ? "Compressing..." : "Compress Images"}
            </button>
          </div>
        </>
      )}

      {zipBlob && (
        <>
          <ImageResultPreview zipBlob={zipBlob} />
          <div className="mt-6 flex justify-center gap-4">
            <a
              href={URL.createObjectURL(zipBlob)}
              download="compressed-images.zip"
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              ⬇️ Download ZIP
            </a>
            <button onClick={reset} className="border px-6 py-3 rounded-lg">
              🔄 Compress more
            </button>
          </div>
        </>
      )}
    </ToolLayout>
  );
}
