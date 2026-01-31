import BottomProgress from "./BottomProgress";

export default function ToolLayout({
  title,
  description,
  children,
  progress,
}) {
  return (
    <>
      <div className="max-w-3xl mx-auto px-1 py-20 text-center tool-content">
        <h1 className="text-4xl font-bold text-gray-800">
          {title}
        </h1>

        <p className="text-gray-600 mt-2 text-xl">
          {description}
        </p>

        <div className="mt-10">{children}</div>
      </div>

      {/* Slim CloudConvert-style progress */}
      {progress && <BottomProgress progress={progress} />}
    </>
  );
}
