import React from "react";

/**
 * Un objet interactif positionné en % sur le décor de la chambre.
 * Affiche "[Entrée] ..." seulement si le joueur est à proximité (isNear).
 */
export default function Hotspot({ x, y, label, isNear, isDone, hidden, glow, pulseRed, onClick }) {
  if (hidden) return null;

  return (
    <div
      className={`hotspot ${isNear ? "hotspot-near" : ""} ${isDone ? "hotspot-done" : ""} ${glow ? "hotspot-glow" : ""} ${pulseRed ? "hotspot-pulse-red" : ""}`}
      style={{ left: `${x}%`, top: `${y}%`, cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="hotspot-marker" />
      {isNear && (
        <div className="hotspot-prompt">
          {label}
        </div>
      )}
    </div>
  );
}
