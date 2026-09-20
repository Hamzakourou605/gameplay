import React, { useEffect } from "react";

export default function ImageModal({ imageSrc, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ padding: "0", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageSrc} 
          alt="Modal" 
          style={{ width: "100%", display: "block", maxHeight: "80vh", objectFit: "contain" }} 
        />
        <div className="modal-footer" style={{ position: "absolute", bottom: "16px", right: "16px", zIndex: 10 }}>
          <button className="btn-primary" onClick={onClose} style={{ background: "rgba(43, 111, 176, 0.8)" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
