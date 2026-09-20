import React from "react";
import "./MainMenu.css";

const MISSIONS = [
  {
    id: "mission1",
    number: "MISSION 01",
    name: "Le Message",
    chapter: "Chapitre 1",
    requiresCompleted: null, // always unlocked
  },
  {
    id: "mission2",
    number: "MISSION 02",
    name: "Le rendez-vous",
    chapter: "Chapitre 1",
    requiresCompleted: "mission1",
  },
  {
    id: "mission3",
    number: "MISSION 03",
    name: "À venir...",
    chapter: "Chapitre 3",
    requiresCompleted: "mission2",
  },
];

export default function ChaptersScreen({ completedMissions, onSelectMission, onBack }) {
  return (
    <div className="chapters-screen">
      <video
        className="chapters-bg-video"
        src={require("../assets/hailuo-2_3_Je_veux_ajouter_une_animation_à_cette_image._Je_veux_que_la_pluie_tombe_de_mani-0.mp4")}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="chapters-overlay" />
      <div className="chapters-content">
        <div className="chapters-title">La Disparition</div>
        <div className="chapters-subtitle">Sélectionnez une mission</div>
        <div className="chapters-grid">
          {MISSIONS.map((m) => {
            const isLocked = m.requiresCompleted && !completedMissions.has(m.requiresCompleted);
            const isDone = completedMissions.has(m.id);
            return (
              <div
                key={m.id}
                className={`chapter-card ${isLocked ? "chapter-card--locked" : ""}`}
                onClick={() => !isLocked && onSelectMission(m.id)}
              >
                <div className="chapter-number">{m.number}</div>
                <div className="chapter-name">{m.name}</div>
                {isLocked && <div className="chapter-lock-icon">🔒</div>}
                <div className={`chapter-status ${isDone ? "chapter-status--done" : ""}`}>
                  {isDone ? "✓ Terminée" : isLocked ? "Verrouillée" : "Disponible"}
                </div>
              </div>
            );
          })}
        </div>
        <button className="chapters-back" onClick={onBack}>← Retour au menu</button>
      </div>
    </div>
  );
}
