import JSZip from "jszip";
import { useEffect, useState } from "react";

export default function ImageResultPreview({ zipBlob }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const extractZip = async () => {
      try {
        const zip = await JSZip.loadAsync(zipBlob);

        const files = Object.keys(zip.files)
          .filter((name) => !zip.files[name].dir);

        const imagePromises = files.map(async (name) => {
          const blob = await zip.files[name].async("blob");
          return {
            name,
            url: URL.createObjectURL(blob),
          };
        });

        const results = await Promise.all(imagePromises);

        if (!cancelled) {
          setImages(results);
          setLoading(false);
        }
      } catch (err) {
        console.error("ZIP preview error:", err);
        setLoading(false);
      }
    };

    extractZip();

    return () => {
      cancelled = true;
    };
  }, [zipBlob]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading previews...
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">
        Converted Images
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.name}
            className="bg-white border rounded-xl p-3 shadow-sm text-center"
          >
            <img
              src={img.url}
              alt={img.name}
              className="mx-auto rounded mb-2 max-h-40 object-contain"
            />

            <div className="text-xs truncate mb-2">
              {img.name}
            </div>

            <a
              href={img.url}
              download={img.name}
              className="inline-block bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
