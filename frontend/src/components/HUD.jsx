import React from "react";

export default function HUD({ clues, objective, mongoStatus }) {
  return (
    <div className="hud">
      <div className="hud-mission">
        <span className="hud-chapter">Chapitre 1 — La disparition</span>
        <span className="hud-objective">{objective}</span>
      </div>
      {clues.length > 0 && (
        <div className="hud-clues">
          <span className="hud-clues-title">Indices</span>
          {clues.map((c, i) => (
            <div key={i} className="hud-clue-item">📍 {c.title} — {c.detail}</div>
          ))}
        </div>
      )}
      <div className={`hud-status ${mongoStatus ? "hud-status-ok" : "hud-status-off"}`}>
        {mongoStatus ? "● Sauvegarde connectée" : "○ Mode hors-ligne"}
      </div>
    </div>
  );
}
