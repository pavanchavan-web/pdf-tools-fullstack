import { useState, useRef } from "react";

const MAX_TIMEOUT = 90_000; // ⏱️ 90 seconds safety timeout

export default function useProgress() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const start = (message = "Processing…") => {
    clearAllTimers();

    setVisible(true);
    setText(message);
    setProgress(10);

    // 🔁 Simulated progress (UX)
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return Math.min(prev + Math.random() * 4 + 1, 90);
      });
    }, 700);

    // ⛔ HARD TIMEOUT SAFETY
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      setVisible(false);
      setProgress(0);
    }, MAX_TIMEOUT);
  };

  const finish = () => {
    clearAllTimers();
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);
  };

  const stop = () => {
    clearAllTimers();
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
