import React, { useState } from "react";

export default function PauseMenu({ isMuted, onToggleMute, onQuit, onResume }) {
  return (
    <div className="pause-overlay">
      <div className="pause-box">
        <h2 className="pause-title">⏸ Pause</h2>
        <div className="pause-divider" />

        <button className="pause-btn" onClick={onToggleMute}>
          {isMuted ? "🔇 Son coupé  — Activer" : "🔊 Son actif  — Couper"}
        </button>

        <button className="pause-btn pause-btn--danger" onClick={onQuit}>
          🚪 Quitter la partie
        </button>

        <button className="pause-btn pause-btn--resume" onClick={onResume}>
          ▶ Reprendre
        </button>
      </div>
    </div>
  );
}
