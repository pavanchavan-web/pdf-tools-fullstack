import { useEffect, useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ImageResultPreview from "../components/ImageResultPreview";
import BeforeAfterCompare from "../components/BeforeAfterCompare";
import { postFile } from "../utils/api";

export default function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  // compression options
  const [quality, setQuality] = useState(74);
  const [format, setFormat] = useState("webp");
  const [keepOriginal, setKeepOriginal] = useState(false);

  const [loading, setLoading] = useState(false);

  // preview
  const [activeIndex, setActiveIndex] = useState(0);
  const [beforeSrc, setBeforeSrc] = useState(null);
  const [afterSrc, setAfterSrc] = useState(null);

  /* -------------------------------
     Auto format handling
  --------------------------------*/
  useEffect(() => {
    if (keepOriginal) {
      setFormat("original");
    } else if (format === "original") {
      setFormat("webp");
    }
  }, [keepOriginal]);

  /* -------------------------------
     Update preview on change
  --------------------------------*/
  useEffect(() => {
    if (!files.length) return;

    const file = files[activeIndex];
    const url = URL.createObjectURL(file);

    setBeforeSrc(url);
    setAfterSrc(url); // simulated preview

    return () => URL.revokeObjectURL(url);
  }, [files, activeIndex, quality, format]);

  /* -------------------------------
     Size calculation (simulated)
  --------------------------------*/
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

  /* -------------------------------
     Compress (FINAL action)
  --------------------------------*/
  const compress = async () => {
    setLoading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("quality", quality);
    formData.append("format", format);
    formData.append("keepOriginal", keepOriginal);

    const blob = await postFile("image-compress", formData);
    setZipBlob(blob);
    setLoading(false);
  };

  const reset = () => {
    setFiles([]);
    setZipBlob(null);
    setActiveIndex(0);
    setBeforeSrc(null);
    setAfterSrc(null);
  };

  return (
    <ToolLayout
      title="AI Image Compressor"
      description="Compress images intelligently with live preview and quality control"
    >
      {/* Upload */}
      {!files.length && !zipBlob && (
        <UploadBox
          accept="image/*"
          multiple
          maxText="Max 20 images per upload. Sign up for more"
          onFiles={(f) => setFiles(f)}
        />
      )}

      {/* CONFIGURATION + PREVIEW */}
      {!zipBlob && files.length > 0 && (
        <>
          {/* Filename */}
          <h3 className="text-center font-medium mb-2">
            {files[activeIndex]?.name}
          </h3>

          {/* Size info */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Original: {originalSizeKB} KB</span>
            <span>
              Preview: ~{previewSizeKB} KB ({savedPercent}%)
            </span>
          </div>

          {/* Before / After */}
          {beforeSrc && afterSrc && (
            <BeforeAfterCompare before={beforeSrc} after={afterSrc} />
          )}

          {/* Bulk thumbnails */}
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

          <p className="text-sm text-gray-500 mb-4">
            Compression settings will apply to all uploaded images
          </p>

          {/* Options */}
          <div className="bg-white border rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              {/* Format */}
              <div>
                <label className="block text-sm mb-1">Format</label>
                <select
                  value={format}
                  disabled={keepOriginal}
                  onChange={(e) => setFormat(e.target.value)}
                  className="border px-3 py-2 rounded disabled:bg-gray-100"
                >
                  <option value="webp">WEBP (Recommended)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="avif">AVIF</option>
                  <option value="png">PNG</option>
                </select>

                {/* Keep original */}
                <div className="flex items-center gap-2 mt-1 justify-center">
                    <input
                    type="checkbox"
                    checked={keepOriginal}
                    onChange={(e) => setKeepOriginal(e.target.checked)}
                    />
                    <span className="text-sm">Keep original format</span>
                </div>

              </div>

              {/* Quality slider */}
                <div className="mt-6 flex items-center gap-4 justify-end">
                    <span className="text-sm font-medium">Quality</span>

                    <input
                    type="range"
                    min="40"
                    max="95"
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

          {/* Compress button */}
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

      {/* RESULT */}
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

            <button
              onClick={reset}
              className="border px-6 py-3 rounded-lg"
            >
              🔄 Compress more
            </button>
          </div>
        </>
      )}
    </ToolLayout>
  );
}
