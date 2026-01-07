export default function ActionButton({ disabled, label, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-6 bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
    >
      {label}
    </button>
  );
}
