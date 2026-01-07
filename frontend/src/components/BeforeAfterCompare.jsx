import { useRef, useState } from "react";

export default function BeforeAfterCompare({ before, after }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);

  const onDrag = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, x)));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => e.buttons === 1 && onDrag(e)}
      className="relative w-full h-[320px] overflow-hidden rounded-lg border cursor-ew-resize"
    >
      <img
        src={before}
        className="absolute inset-0 w-full h-full object-contain"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={after}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow">
          ⟷
        </div>
      </div>
    </div>
  );
}
