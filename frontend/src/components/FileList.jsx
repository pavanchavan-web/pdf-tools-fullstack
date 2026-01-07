export default function FileList({ files, onRemove }) {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-4 text-left">
      {files.map((file, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b py-2"
        >
          <span className="text-sm">{file.name}</span>
          <button
            onClick={() => onRemove(i)}
            className="text-red-500"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
