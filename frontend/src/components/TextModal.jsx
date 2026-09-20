import React, { useEffect } from "react";

export default function TextModal({ title, lines, code, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">
          {lines.map((line, i) => (
            <p key={i} className="modal-line">{line}</p>
          ))}
          {code && <pre className="modal-code">{code}</pre>}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            <kbd>Entrée</kbd> Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
