import React from "react";

export default function MissionComplete({ nextMission, onNextMission, onMenu }) {
  return (
    <div className="modal-overlay mission-complete-overlay">
      <div className="mission-complete-box">
        <h1>MISSION TERMINÉE</h1>
        <p className="mc-line">Nouvel indice obtenu : <strong>Localisation mystérieuse</strong></p>
        <div className="mc-divider" />
        <p className="mc-next">Mission suivante débloquée :</p>
        <p className="mc-next-title">{nextMission}</p>
        <div className="mc-actions">
          {onNextMission && (
            <button className="mc-btn mc-btn--primary" onClick={onNextMission}>
              Passer à la Mission 2 →
            </button>
          )}
          <button className="mc-btn mc-btn--secondary" onClick={onMenu}>
            ← Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}

