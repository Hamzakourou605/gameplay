import React, { useCallback, useEffect, useRef, useState } from "react";
import MainMenu from "./components/MainMenu";
import ChaptersScreen from "./components/ChaptersScreen";
import PauseMenu from "./components/PauseMenu";
import Hotspot from "./components/Hotspot";
import TextModal from "./components/TextModal";
import PhoneSequence from "./components/PhoneSequence";
import MissionComplete from "./components/MissionComplete";
import HUD from "./components/HUD";
import VideoModal from "./components/VideoModal";
import ImageModal from "./components/ImageModal";
import PythonTerminal from "./components/PythonTerminal";
import InventoryPanel from "./components/InventoryPanel";
import Mission2 from "./components/Mission2";
import { getState, saveState, addClue } from "./api";

const OBJECTS = {
  laptop:  { x: 79, y: 60, label: "Interagir (Laptop)" },
  radio:   { x: 67, y: 56, label: "Écouter la radio" },
  feuille: { x: 61, y: 61, label: "Examiner la feuille" },
  photo:   { x: 14, y: 21, label: "Regarder la photo" },
  carnet:  { x: 40, y: 23, label: "Examiner le carnet" },
  phone:   { x: 17, y: 85, label: "Prendre le téléphone" },
};

const NEEDED_BEFORE_PHONE = ["laptop", "radio", "feuille"];

// ─────────────────────────────────────────────────────────────────────────────
// Mission 1
// ─────────────────────────────────────────────────────────────────────────────
function Mission1({ onComplete, onQuit, onGoToMission2, sharedInventory, setSharedInventory }) {
  const [examined, setExamined]         = useState(new Set());
  const [phoneFound, setPhoneFound]     = useState(false);
  const [activeModal, setActiveModal]   = useState(null);
  const [clues, setClues]               = useState([]);
  const [missionCompleted, setMission]  = useState(false);
  const [mongoOk, setMongoOk]           = useState(false);
  const [paused, setPaused]             = useState(false);
  const [isMuted, setIsMuted]           = useState(false);
  // feuille flow: null | 'image' | 'terminal' | 'done'
  const [feuilleStep, setFeuilleStep]   = useState(null);
  // laptop flow: null | 'text' | 'glitch' | 'bardemav'
  const [laptopStep, setLaptopStep]     = useState(null);
  const [codeDecrypted, setCodeDecrypted] = useState(false);

  const audioRef = useRef(null);
  const sfxRef   = useRef(null);

  // Load save
  useEffect(() => {
    (async () => {
      const state = await getState();
      if (!state) return;
      setMongoOk(!state.warning);
      if (state.examined_objects) setExamined(new Set(state.examined_objects));
      if (state.phone_found) setPhoneFound(true);
      if (state.clues) setClues(state.clues);
      if (state.mission_completed) setMission(true);
      if (state.code_decrypted) {
        setCodeDecrypted(true);
        addInventoryItem({ id: "code-doiron", icon: "DOC", name: "Code déchiffré", detail: "DOIRON" });
      }
    })();
  }, []); // eslint-disable-line

  const phoneRevealed = codeDecrypted;

  // Ambient music
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!missionCompleted) {
      const audio = new Audio(require("./assets/music/The_Deepening_Cold (1).mp3"));
      audio.loop = true;
      audio.volume = 0.15;
      audio.muted = isMuted;
      audioRef.current = audio;
      
      const play = () => {
        if (audioRef.current === audio) {
          audio.play().catch(() => {});
        }
      };
      
      play();
      document.addEventListener("click", play, { once: true });
      
      return () => { 
        audio.pause(); 
        document.removeEventListener("click", play); 
      };
    }
  }, [missionCompleted]); // intentionally excluding isMuted to prevent restarting the track

  // Handle mute without restarting the track
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  function toggleMute() {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }

  function addInventoryItem(item) {
    setSharedInventory(prev =>
      prev.find(i => i.id === item.id) ? prev : [...prev, item]
    );
  }

  // Mark object as examined
  function markExamined(target) {
    setExamined((prev) => {
      const next = new Set(prev);
      next.add(target);
      saveState({ examined_objects: Array.from(next) });
      return next;
    });
  }

  // Interaction
  const handleInteract = useCallback((target) => {
    if (activeModal || feuilleStep || laptopStep || paused) return;
    if (!target) return;

    // Sound effects
    try {
      if (target === "radio") {
        const sfx = new Audio(require("./assets/Radio-AM-FM-Tuning-Sound-Effect-Old-Radio-Switching-Channels-♪.mp3"));
        sfx.volume = 0.6;
        sfxRef.current = sfx;
        sfx.play().catch(() => {});
      } else if (target === "laptop") {
        const sfx = new Audio(require("./assets/Old VHS Sound - Damaged VHS Sound Effect.mp3"));
        sfx.volume = 0.5;
        sfxRef.current = sfx;
        sfx.play().catch(() => {});
      }
    } catch(e) {}

    if (target === "phone") { setActiveModal("phone-sequence"); return; }

    // Feuille → image → terminal
    if (target === "feuille") {
      markExamined("feuille");
      setFeuilleStep("image");
      return;
    }

    // Laptop → different depending on code decrypted
    if (target === "laptop") {
      markExamined("laptop");
      if (codeDecrypted) {
        setLaptopStep("bardemav");
      } else {
        setLaptopStep("text");
      }
      return;
    }

    setActiveModal(target);
    markExamined(target);
  }, [activeModal, feuilleStep, laptopStep, paused, phoneFound, phoneRevealed, codeDecrypted]); // eslint-disable-line

  function stopSfx() {
    if (sfxRef.current) {
      sfxRef.current.pause();
      sfxRef.current.currentTime = 0;
      sfxRef.current = null;
    }
  }

  function closeModal() { stopSfx(); setActiveModal(null); }

  async function handlePhoneSequenceComplete(location) {
    setPhoneFound(true);
    await saveState({ phone_found: true, message_read: true });
    await addClue({ type: "location", title: location.title, detail: location.detail });
    setClues((c) => [...c, location]);
    setActiveModal("mission-complete");
    setMission(true);
    await saveState({ mission_completed: true, next_mission_unlocked: "Mission 2 — Le rendez-vous" });
    onComplete("mission1");
  }

  function handleCodeDecrypted() {
    setCodeDecrypted(true);
    saveState({ code_decrypted: true });
    // Add to inventory
    addInventoryItem({ id: "code-doiron", icon: "DOC", name: "Code déchiffré", detail: "DOIRON" });
    // Close terminal, go to laptop
    setFeuilleStep(null);
    setLaptopStep("bardemav");
  }

  const objective = !phoneRevealed
    ? "Objectif : explorer la chambre (laptop, radio, feuille...)"
    : !phoneFound
    ? "Objectif : retrouver le téléphone d'Adam"
    : missionCompleted
    ? "Mission 1 terminée"
    : "Objectif : lire le message d'Adam";

  return (
    <div className="game-root">
      {/* ── Top bar ── */}
      <div className="game-topbar">
        <button className="game-icon-btn" title="Son" onClick={toggleMute}>
          {isMuted ? "Son OFF" : "Son ON"}
        </button>
        <button className="game-icon-btn" title="Paramètres" onClick={() => setPaused(true)}>
          Menu
        </button>
      </div>

      {/* ── Inventory Panel ── */}
      <InventoryPanel items={sharedInventory} />

      {/* ── Room ── */}
      <div className="room">
        <video
          className="room-video-bg"
          src={require("./assets/hailuo-2_3_Je_veux_animer_la_pluie_dans_l\u2019image._Je_veux_aussi_que_l\u2019\u00e9cran_ait_des_eff-0.mp4")}
          autoPlay loop muted playsInline
        />
        <Hotspot {...OBJECTS.laptop}  isNear={true} isDone={examined.has("laptop")}  onClick={() => handleInteract("laptop")} />
        <Hotspot {...OBJECTS.radio}   isNear={true} isDone={examined.has("radio")}   onClick={() => handleInteract("radio")} />
        <Hotspot {...OBJECTS.feuille} isNear={true} isDone={examined.has("feuille")} onClick={() => handleInteract("feuille")} />
        <Hotspot {...OBJECTS.photo}   isNear={true} isDone={examined.has("photo")}   onClick={() => handleInteract("photo")} />
        <Hotspot {...OBJECTS.carnet}  isNear={true} isDone={examined.has("carnet")}  onClick={() => handleInteract("carnet")} />
        <Hotspot {...OBJECTS.phone} isNear={true} hidden={!phoneRevealed || phoneFound} pulseRed={true} onClick={() => handleInteract("phone")} />
        <HUD clues={clues} objective={objective} mongoStatus={mongoOk} />
        {!phoneRevealed && (
          <div className="hint-banner">Explorez la chambre — cliquez sur un objet pour l'examiner</div>
        )}
      </div>

      {/* ── Pause ── */}
      {paused && (
        <PauseMenu isMuted={isMuted} onToggleMute={toggleMute} onResume={() => setPaused(false)} onQuit={onQuit} />
      )}

      {/* ── Feuille: image → decrypt button ── */}
      {feuilleStep === "image" && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ padding: 0, overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.12)", maxWidth: 560 }}>
            <img src={require("./assets/code.png")} alt="Code" style={{ width: "100%", display: "block", maxHeight: "60vh", objectFit: "contain" }} />
            <div className="modal-footer" style={{ background: "#0d0f16", padding: "16px 20px", justifyContent: "space-between" }}>
              {!codeDecrypted ? (
                <button className="btn-primary" style={{ background: "#1a4a2a", color: "#7be89a", border: "1px solid #3a8a4a" }}
                  onClick={() => setFeuilleStep("terminal")}>
                  Décrypter le code
                </button>
              ) : (
                <span style={{ color: "#7be89a", fontSize: 13 }}>Déjà déchiffré : <strong>DOIRON</strong></span>
              )}
              <button className="btn-primary" onClick={() => { stopSfx(); setFeuilleStep(null); }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feuille: Python Terminal ── */}
      {feuilleStep === "terminal" && (
        <PythonTerminal
          onSuccess={handleCodeDecrypted}
          onClose={() => setFeuilleStep("image")}
        />
      )}

      {/* ── Laptop: text ── */}
      {laptopStep === "text" && (
        <TextModal
          title="Laptop"
          lines={["L'écran s'allume dans la pénombre.", "Un fichier est ouvert : une carte du ciel, des notes éparses.", "« Adam travaillait encore ici... »", codeDecrypted ? "" : "[Un accès protégé par mot de passe est détecté]"]}
          onClose={() => { stopSfx(); setLaptopStep("glitch"); }}
        />
      )}

      {/* ── Laptop: glitch video ── */}
      {laptopStep === "glitch" && (
        <VideoModal
          videoSrc={require("./assets/glitchecram/glitchecram.mp4")}
          onClose={() => { stopSfx(); setLaptopStep(null); }}
        />
      )}

      {/* ── Laptop: BAR DE MAV (after code) ── */}
      {laptopStep === "bardemav" && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ padding: 0, overflow: "hidden", background: "#000", border: "1px solid rgba(123,232,154,0.3)", maxWidth: 700 }}>
            <div style={{ background: "#1a1d24", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>ORDINATEUR D'ADAM — Accès autorisé · DOIRON</span>
            </div>
            <img src={require("./assets/BAR DE MAV.png")} alt="Adam's Computer" style={{ width: "100%", display: "block", maxHeight: "65vh", objectFit: "contain" }} />
            <div className="modal-footer" style={{ background: "#0d0f16", padding: "16px 20px" }}>
              <button className="btn-primary" onClick={() => { stopSfx(); setLaptopStep(null); }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Other modals ── */}
      {activeModal === "radio" && (
        <ImageModal imageSrc={require("./assets/radio.png")} onClose={closeModal} />
      )}
      {activeModal === "photo" && (
        <TextModal title="Photo" lines={["Une vieille photo. Adam, plus jeune, souriant.", "« Il devait être pressé... »"]} onClose={closeModal} />
      )}
      {activeModal === "carnet" && (
        <ImageModal imageSrc={require("./assets/carnet_image.png")} onClose={closeModal} />
      )}
      {activeModal === "phone-sequence" && (
        <PhoneSequence onComplete={handlePhoneSequenceComplete} />
      )}
      {activeModal === "mission-complete" && (
        <MissionComplete nextMission="Mission 2 — Le rendez-vous" onNextMission={onGoToMission2} onMenu={onQuit} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("menu");
  const [completedMissions, setCompleted] = useState(new Set());
  // Shared inventory travels across missions
  const [sharedInventory, setSharedInventory] = useState([]);
  
  const appAudioRef = useRef(null);

  // App-level music (Menu, Chapters, Mission 2)
  useEffect(() => {
    const isAppMusicScreen = screen === "menu" || screen === "chapters" || screen === "mission2";
    
    if (isAppMusicScreen) {
      if (!appAudioRef.current) {
        const audio = new Audio(require("./assets/music/menu_music.mp3"));
        audio.loop = true;
        audio.volume = 0.15;
        appAudioRef.current = audio;
        
        const play = () => {
          if (appAudioRef.current === audio) {
            audio.play().catch(() => {});
          }
        };
        play();
        document.addEventListener("click", play, { once: true });
        
        // Save the listener so we can remove it later if needed
        audio.dataset.hasListener = "true";
      }
    } else {
      if (appAudioRef.current) {
        appAudioRef.current.pause();
        appAudioRef.current = null;
      }
    }
  }, [screen]);

  useEffect(() => {
    (async () => {
      const state = await getState();
      if (state && state.mission_completed) {
        setCompleted(prev => new Set([...prev, "mission1"]));
      }
      if (state && state.code_decrypted) {
        setSharedInventory([{ id: "code-doiron", icon: "DOC", name: "Code déchiffré", detail: "DOIRON" }]);
      }
    })();
  }, []);

  function handleMissionComplete(missionId) {
    setCompleted(prev => new Set([...prev, missionId]));
  }

  if (screen === "menu") {
    return <MainMenu onPlay={() => setScreen("mission1")} onChapters={() => setScreen("chapters")} />;
  }
  if (screen === "chapters") {
    return <ChaptersScreen completedMissions={completedMissions} onSelectMission={(id) => setScreen(id)} onBack={() => setScreen("menu")} />;
  }
  if (screen === "mission1") {
    return (
      <Mission1
        onComplete={handleMissionComplete}
        onQuit={() => setScreen("menu")}
        onGoToMission2={() => setScreen("mission2")}
        sharedInventory={sharedInventory}
        setSharedInventory={setSharedInventory}
      />
    );
  }

  // Mission 2
  if (screen === "mission2") {
    return (
      <Mission2 
        onComplete={() => setScreen("menu")}
        addInventoryItem={(item) => setSharedInventory(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item])}
      />
    );
  }

  return null;
}
