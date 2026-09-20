import React, { useEffect, useState } from "react";
import "./MainMenu.css";

const BUTTONS = [
  { id: "jouer",      off: require("../assets/buttom off/jouer.png"),      on: require("../assets/buttom om/jouer.png") },
  { id: "chapters",   off: require("../assets/buttom off/chapters.png"),    on: require("../assets/buttom om/chapters.png") },
  { id: "parametres", off: require("../assets/buttom off/parameters.png"),  on: require("../assets/buttom om/parametres.png") },
  { id: "apropos",    off: require("../assets/buttom off/a propos.png"),    on: require("../assets/buttom om/a propos.png") },
  { id: "quitter",    off: require("../assets/buttom off/quitter.png"),     on: require("../assets/buttom om/quitter.png") },
];

export default function MainMenu({ onPlay, onChapters }) {
  const [visible, setVisible] = useState([]);
  const [hovered, setHovered] = useState(null);

  // Buttons appear one by one with staggered animation
  useEffect(() => {
    BUTTONS.forEach((btn, i) => {
      setTimeout(() => {
        setVisible(prev => [...prev, btn.id]);
      }, 300 + i * 200);
    });
  }, []);

  function handleClick(id) {
    if (id === "jouer") onPlay();
    else if (id === "chapters") onChapters();
    else if (id === "quitter") window.close();
  }

  return (
    <div className="main-menu">
      <video
        className="menu-bg-video"
        src={require("../assets/hailuo-2_3_Je_veux_ajouter_une_animation_à_cette_image._Je_veux_que_la_pluie_tombe_de_mani-0.mp4")}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="menu-overlay" />
      <div className="menu-buttons">
        {BUTTONS.map((btn) => (
          <button
            key={btn.id}
            className={`menu-btn ${visible.includes(btn.id) ? "menu-btn--visible" : ""}`}
            onMouseEnter={() => setHovered(btn.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(btn.id)}
          >
            <img
              src={hovered === btn.id ? btn.on : btn.off}
              alt={btn.id}
              className="menu-btn-img"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
