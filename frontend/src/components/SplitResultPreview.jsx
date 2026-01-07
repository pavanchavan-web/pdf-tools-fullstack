import JSZip from "jszip";
import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function SplitResultPreview({ zipBlob }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadZip = async () => {
      const zip = await JSZip.loadAsync(zipBlob);
      const results = [];

      for (const filename of Object.keys(zip.files)) {
        if (!filename.endsWith(".pdf")) continue;

        const pdfBlob = await zip.files[filename].async("blob");
        const buffer = await pdfBlob.arrayBuffer();

        // 🔑 Load PDF with pdf.js
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (cancelled) return;

        results.push({
          filename,
          image: canvas.toDataURL("image/jpeg", 0.7),
          blobUrl: URL.createObjectURL(
            new Blob([pdfBlob], { type: "application/pdf" })
          ),
        });
      }

      if (!cancelled) setFiles(results);
    };

    loadZip();

    return () => {
      cancelled = true;
    };
  }, [zipBlob]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Split results</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
        {files.map((f) => (
          <div
            key={f.filename}
            className="bg-white border rounded-xl p-3 shadow-sm text-center"
          >
            {/* ✅ REAL PDF PAGE IMAGE */}
            <img
              src={f.image}
              alt={f.filename}
              className="mx-auto rounded mb-2"
            />

            <div className="text-xs font-medium truncate">
              {f.filename}
            </div>

            <a
              href={f.blobUrl}
              download={f.filename}
              className="mt-2 inline-block bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
