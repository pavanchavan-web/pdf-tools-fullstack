import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import UploadBox from "../components/UploadBox";
import ImageResultPreview from "../components/ImageResultPreview";
import ProcessingOverlay from "../components/ProcessingOverlay";
import useProgress from "../hooks/useProgress";
import { postFile } from "../utils/api";

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

export default function ImageConvert({
  targetFormat = "jpeg",
  title,
  desc,
  maxText = "Max 20 images per upload. Sign up for more",
}) {
  const pageTitle = title || "Image Converter";
  const pageDesc =
    desc ||
    "Convert images between JPG, PNG, WEBP, AVIF, BMP, GIF, SVG and TIFF";

  const [items, setItems] = useState([]);
  const [commonOutput, setCommonOutput] = useState(targetFormat);
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Progress system (ADDED)
  const {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  } = useProgress();

  const addFiles = (files) => {
    if (items.length + files.length > MAX_IMAGES) {
      alert("You can upload a maximum of 20 images at a time.");
      return;
    }

    const mapped = files.map((f) => ({
      file: f,
      output: targetFormat,
    }));

    setItems((prev) => [...prev, ...mapped]);
  };

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

  const handleConvert = async () => {
    if (items.length === 0) return;

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
      finish(); // 🔥 progress → 100%
      setZipBlob(blob);
    } catch (err) {
      stop();
      alert("Image conversion failed");
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
    <ToolLayout title={pageTitle} description={pageDesc}>
      {/* 🔄 Progress Overlay (ADDED) */}
      <ProcessingOverlay
        visible={visible}
        progress={progress}
        text={text}
      />

      {/* Upload */}
      {items.length === 0 && !zipBlob && !visible && (
        <UploadBox
          accept="image/*"
          multiple
          maxText={maxText}
          onFiles={addFiles}
        />
      )}

      {/* File list */}
      {items.length > 0 && !zipBlob && !visible && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <button
                onClick={() =>
                  document.getElementById("addMoreImages").click()
                }
                className="text-blue-600 font-medium flex items-center gap-1"
              >
                ➕ Add more images
              </button>

              <input
                id="addMoreImages"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles([...e.target.files])}
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                Convert all images to:
              </span>

              <select
                value={commonOutput}
                onChange={(e) =>
                  applyCommonOutput(e.target.value)
                }
                className="border rounded px-3 py-2 font-medium"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b"
            >
              <div className="text-left">
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

          <div className="flex items-center justify-between px-4 py-4 bg-gray-50">
            <div className="text-sm">
              Convert {items.length} / {MAX_IMAGES} images
            </div>

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

      {/* Result */}
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
  );
}
