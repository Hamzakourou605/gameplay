import React, { useState, useEffect, useRef } from "react";
import "./Mission1Intro.css";

export default function Mission1Intro({ onComplete }) {
  // step: 1 (sage.mp4) | 2 (sceme2.mp4) | 3 (0924(1).mp4) | 'blackout'
  const [step, setStep] = useState(1);
  const [sub1Visible, setSub1Visible] = useState(false);
  const [scene2Sub, setScene2Sub] = useState("porte"); // 'porte' | 'adam'
  const [showOminousText, setShowOminousText] = useState(false);

  const videoRef = useRef(null);
  const scene2TimerRef = useRef(null);

  // Scene 1: trigger subtitle after 3 seconds of playback
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setSub1Visible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle Scene 1 end
  function handleScene1Ended() {
    setStep(2);
    setScene2Sub("porte");
  }

  // Handle Scene 2 time updates (switch to "Adam ?" near the end)
  function handleScene2TimeUpdate() {
    if (!videoRef.current || step !== 2) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0 && currentTime >= duration - 2.0) {
      setScene2Sub("adam");
    }
  }

  // Handle Scene 2 end -> switch to Scene 3
  function handleScene2Ended() {
    setScene2Sub("adam");
    // Show "Adam ?" briefly if not already seen, then switch to scene 3
    scene2TimerRef.current = setTimeout(() => {
      setStep(3);
    }, 1200);
  }
  
  // Handle Scene 3 end -> switch to blackout
  function handleScene3Ended() {
    setStep("blackout");
  }

  // Blackout sequence
  useEffect(() => {
    if (step === "blackout") {
      // 1 second of black screen, then text appears
      const textTimer = setTimeout(() => {
        setShowOminousText(true);
      }, 1000);

      // After reading the text for ~2.8s, enter the room
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 3800);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [step, onComplete]);

  // Clean up any timers on unmount
  useEffect(() => {
    return () => {
      if (scene2TimerRef.current) clearTimeout(scene2TimerRef.current);
    };
  }, []);

  // Handle Skip Button
  function handleSkip() {
    if (step === 1) {
      handleScene1Ended();
    } else if (step === 2) {
      if (scene2TimerRef.current) clearTimeout(scene2TimerRef.current);
      setStep(3);
    } else if (step === 3) {
      setStep("blackout");
    } else if (step === "blackout") {
      onComplete();
    }
  }

  return (
    <div className="m1-intro-container">
      {/* Skip button always available */}
      <button className="m1-intro-skip-btn" onClick={handleSkip}>
        Passer
      </button>

      {/* Cinematic Vignette */}
      <div className="m1-intro-letterbox" />

      {/* SCENE 1 */}
      {step === 1 && (
        <>
          <video
            ref={videoRef}
            className="m1-intro-video"
            src={require("../assets/scemes/sage.mp4")}
            autoPlay
            playsInline
            onEnded={handleScene1Ended}
          />
          {sub1Visible && (
            <div className="m1-intro-subtitle-bar">
              <span className="m1-intro-speaker">Yanis :</span>
              <span className="m1-intro-dialogue">« Adam ne répond plus... »</span>
            </div>
          )}
        </>
      )}

      {/* SCENE 2 */}
      {step === 2 && (
        <>
          <video
            ref={videoRef}
            className="m1-intro-video"
            src={require("../assets/scemes/sceme2.mp4")}
            autoPlay
            playsInline
            onTimeUpdate={handleScene2TimeUpdate}
            onEnded={handleScene2Ended}
          />
          <div className="m1-intro-subtitle-bar">
            <span className="m1-intro-speaker">Yanis :</span>
            <span className="m1-intro-dialogue">
              {scene2Sub === "porte" ? "« La porte est ouverte... »" : "« Adam ? »"}
            </span>
          </div>
        </>
      )}

      {/* SCENE 3 */}
      {step === 3 && (
        <video
          ref={videoRef}
          className="m1-intro-video"
          src={require("../assets/scemes/0924(1).mp4")}
          autoPlay
          playsInline
          onEnded={handleScene3Ended}
        />
      )}

      {/* BLACKOUT & OMINOUS TEXT */}
      {step === "blackout" && (
        <div className="m1-intro-blackout">
          {showOminousText && (
            <div className="m1-intro-ominous-text">
              Quelque chose ne va pas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
