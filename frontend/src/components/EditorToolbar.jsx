export default function EditorToolbar({ selected, update, remove }) {
  if (!selected) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white shadow rounded px-4 py-2 flex gap-2 z-50">
      <button
        onClick={() => update({ bold: !selected.bold })}
        className="px-2 py-1 border rounded"
      >
        B
      </button>

      <input
        type="number"
        value={selected.fontSize}
        onChange={(e) => update({ fontSize: +e.target.value })}
        className="w-16 border px-1"
      />

      <button
        onClick={remove}
        className="px-2 py-1 bg-red-500 text-white rounded"
      >
        Delete
      </button>
    </div>
  );
}
