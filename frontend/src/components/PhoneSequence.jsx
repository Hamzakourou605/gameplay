import React, { useState, useRef, useEffect } from "react";

const LOCATION = { title: "Café Nova", detail: "21:30" };

// Emotion reactions shown after the phone videos
const REACTIONS = [
  {
    emotion: "surprise",
    img: require("../assets/emotion_surprise.png"),
    thought: "« C'est... ce n'est pas possible. Adam... »",
    subtext: "Yanis tient le téléphone, paralysé.",
  },
  {
    emotion: "fear",
    img: require("../assets/emotion_fear.png"),
    thought: "« Ne fais confiance à personne. Mais... pourquoi me le dire maintenant ? »",
    subtext: "Un frisson glacé le parcourt de la tête aux pieds.",
  },
  {
    emotion: "paranoid",
    img: require("../assets/emotion_paranoid.png"),
    thought: "« Café Nova, 21:30. Je dois y aller. Je dois savoir. »",
    subtext: "Yanis serre les dents et range le téléphone.",
  },
];

export default function PhoneSequence({ onComplete }) {
  // step: 1 = video1, 2 = video2, 3+ = emotions (index 0..2)
  const [step, setStep] = useState(1);
  const [emotionIdx, setEmotionIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (step <= 2 && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [step]);

  // Fade-in emotion card
  useEffect(() => {
    if (step === 3) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [step, emotionIdx]);

  function handleVideoEnd() {
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }
  }

  function handleEmotionNext() {
    if (emotionIdx < REACTIONS.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setEmotionIdx(i => i + 1);
      }, 280);
    } else {
      onComplete(LOCATION);
    }
  }

  function handleSkip() {
    if (step <= 2) handleVideoEnd();
    else handleEmotionNext();
  }

  const isEmotionPhase = step === 3;
  const reaction = REACTIONS[emotionIdx];

  return (
    <div className="modal-overlay phone-overlay" onClick={!isEmotionPhase ? handleSkip : undefined}>
      {/* ── VIDEO PHASE ── */}
      {!isEmotionPhase && (
        <div className="phone-frame" onClick={(e) => e.stopPropagation()} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="phone-notch" style={{ zIndex: 10 }} />
          <div className="phone-screen" style={{ padding: 0, flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "#000", borderRadius: "18px", overflow: "hidden" }}>
            {step === 1 && (
              <video ref={videoRef} src={require("../assets/message adam.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} onEnded={handleVideoEnd} autoPlay />
            )}
            {step === 2 && (
              <video ref={videoRef} src={require("../assets/message localisatio.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} onEnded={handleVideoEnd} autoPlay />
            )}
          </div>
          <div className="phone-footer" style={{ zIndex: 10 }}>
            <button className="btn-primary" onClick={handleSkip}>Passer</button>
          </div>
        </div>
      )}

      {/* ── EMOTION PHASE ── */}
      {isEmotionPhase && (
        <div
          className="emotion-scene"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
          onClick={handleEmotionNext}
        >
          <div className="emotion-scene-portrait">
            <img src={reaction.img} alt={reaction.emotion} className="emotion-scene-img" />
          </div>
          <div className="emotion-scene-bubble">
            <p className="emotion-scene-thought">{reaction.thought}</p>
            <p className="emotion-scene-sub">{reaction.subtext}</p>
          </div>
          <div className="emotion-scene-hint">
            {emotionIdx < REACTIONS.length - 1 ? "Cliquez pour continuer..." : "Cliquez pour terminer"}
          </div>
          {/* Progress dots */}
          <div className="emotion-dots">
            {REACTIONS.map((_, i) => (
              <span key={i} className={`emotion-dot ${i === emotionIdx ? "emotion-dot--active" : ""}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { LOCATION };
