import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfPagePreview({ file }) {
  const [pages, setPages] = useState([]);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!file || renderedRef.current) return;
    renderedRef.current = true;

    let cancelled = false;

    const loadPdf = async () => {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      const previews = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) return;

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        previews.push({
          pageNumber: i,
          src: canvas.toDataURL("image/jpeg", 0.6),
        });
      }

      if (!cancelled) setPages(previews);
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
      {pages.map((p) => (
        <div
          key={p.pageNumber}
          className="bg-white border rounded-lg p-2 text-center"
        >
          <img
            src={p.src}
            alt={`Page ${p.pageNumber}`}
            className="mx-auto rounded"
          />
          <div className="mt-1 text-xs text-gray-600">
            Page {p.pageNumber}
          </div>
        </div>
      ))}
    </div>
  );
}
