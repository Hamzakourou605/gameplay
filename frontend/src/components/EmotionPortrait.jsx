import React from "react";
import neutral from "../assets/emotion_neutral.png";
import surprise from "../assets/emotion_surprise.png";
import fear from "../assets/emotion_fear.png";
import paranoid from "../assets/emotion_paranoid.png";
import determination from "../assets/emotion_determination.png";
import glitch from "../assets/emotion_glitch.png";

// Chaque émotion du script est mappée sur une des images fournies.
export const EMOTIONS = {
  neutral: { img: neutral, label: "Calme" },
  surprise: { img: surprise, label: "Surprise" },
  fear: { img: fear, label: "Choc" },
  worry: { img: paranoid, label: "Inquiétude" },
  determination: { img: determination, label: "Détermination" },
  glitch: { img: glitch, label: "Interférence" },
};

export default function EmotionPortrait({ emotion = "neutral", size = 120 }) {
  const data = EMOTIONS[emotion] || EMOTIONS.neutral;
  return (
    <div className="emotion-portrait" style={{ width: size }}>
      <img src={data.img} alt={`Yanis - ${data.label}`} className="emotion-portrait-img" />
      <span className="emotion-portrait-label">{data.label}</span>
    </div>
  );
}
