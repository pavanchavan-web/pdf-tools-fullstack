export default function ProcessingOverlay({
  visible,
  progress,
  text,
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg px-8 py-6 w-80 text-center">
        <div className="text-sm font-medium mb-3">
          {text}
        </div>

        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-indigo-600 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs text-gray-500 mt-2">
          {progress}%
        </div>
      </div>
    </div>
  );
}
