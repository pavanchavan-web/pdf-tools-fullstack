import { useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UploadBox({
  accept,
  multiple = false,
  onFiles,
  maxText = "Max file size 1GB. Sign up for more",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    onFiles(multiple ? Array.from(files) : [files[0]]);
  };

  return (
    <div
      className={`w-full rounded-2xl border-2 border-dashed transition
        ${
          dragging
            ? "border-blue-500 bg-blue-50 shadow-lg"
            : "border-gray-300 bg-white shadow-lg"
        }
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Content */}
      <div
        className="flex flex-col items-center justify-center py-20 cursor-pointer"
        onClick={() => inputRef.current.click()}
      >
        {/* Button */}
        <button
          type="button"
          className="flex items-center gap-2 btn-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Choose Files
        </button>

        {/* Info text */}
        <p className="mt-3 text-sm text-gray-600">
          or drop files/images here
        </p>

        <p className="mt-3 text-sm text-gray-600">
          {maxText}{" "}
          <Link to="/sign-up" className="text-blue-600 hover:underline text-sm">
            Sign up
          </Link>
        </p>

        {/* Legal */}
        <p className="mt-1 text-xs text-gray-400">
          By proceeding, you agree to our{" "}
          <Link to="/terms-conditions" className="text-sm underline cursor-pointer">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
