export default function BottomProgress({ progress = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-200 z-50 ">
      <div
        className="h-1 bg-indigo-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
