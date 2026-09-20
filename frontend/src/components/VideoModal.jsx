import React, { useEffect, useRef } from "react";

export default function VideoModal({ videoSrc, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => console.log("Video auto-play failed", e));
    }
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ padding: "0", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.12)" }}>
        <video 
          ref={videoRef}
          src={videoSrc} 
          style={{ width: "100%", display: "block" }} 
          controls={false}
          autoPlay
          loop
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
