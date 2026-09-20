import React, { useEffect } from "react";
import "./Mission2.css";

export default function DialogueBox({ lines, onComplete }) {
  const [currentLine, setCurrentLine] = React.useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter" || e.key === " ") {
        if (currentLine < lines.length - 1) {
          setCurrentLine(curr => curr + 1);
        } else {
          onComplete();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLine, lines, onComplete]);

  const line = lines[currentLine];

  return (
    <div className="dialogue-box-container">
      <div className="dialogue-box">
        <div className="dialogue-speaker">{line.speaker}</div>
        <div className="dialogue-text">{line.text}</div>
        <div className="dialogue-hint">[Entrée] pour continuer...</div>
      </div>
    </div>
  );
}
