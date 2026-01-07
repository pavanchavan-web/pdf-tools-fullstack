export default function ResultPanel({ fileUrl, fileName, onReset }) {
  return (
    <div className="mt-10 bg-white rounded-xl shadow-sm p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800">
        ✅ Your file is ready
      </h3>

      {/* Preview */}
      <div className="mt-4 border rounded-lg overflow-hidden">
        <iframe
          src={fileUrl}
          title="PDF Preview"
          className="w-full h-96"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-center gap-4">
        <a
          href={fileUrl}
          download={fileName}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Download
        </a>

        <button
          onClick={onReset}
          className="border px-6 py-3 rounded-lg"
        >
          Process another file
        </button>
      </div>
    </div>
  );
}
