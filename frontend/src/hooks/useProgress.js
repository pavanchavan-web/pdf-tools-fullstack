import { useState } from "react";

export default function useProgress() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  const start = (message = "Processing…") => {
    setVisible(true);
    setText(message);
    setProgress(15);
  };

  const finish = () => {
    setProgress(100);
    setTimeout(() => setVisible(false), 600);
  };

  const stop = () => {
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
