export default function ProcessingOverlay({
  visible,
  progress,
  text,
}) {
  if (!visible) return null;

  // Safety clamp
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
    >
      <div className="bg-white rounded-xl shadow-lg px-8 py-6 w-80 text-center">
        <div className="text-sm font-medium mb-3">
          {text || "Processing…"}
        </div>

        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-2 bg-indigo-600 rounded transition-[width] duration-500 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        <div className="text-xs text-gray-500 mt-2">
          {safeProgress}%
        </div>
      </div>
    </div>
  );
}
