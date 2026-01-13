import { useState, useRef } from "react";

export default function useProgress() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  const timerRef = useRef(null);

  const start = (message = "Processing…") => {
    // Reset
    clearInterval(timerRef.current);

    setVisible(true);
    setText(message);
    setProgress(10);

    // Simulated progress (UX trick)
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // cap at 90%
        return prev + Math.random() * 3 + 1; // smooth growth
      });
    }, 700);
  };

  const finish = () => {
    clearInterval(timerRef.current);
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setVisible(false);
    setProgress(0);
  };

  return {
    visible,
    progress,
    text,
    start,
    finish,
    stop,
  };
}
