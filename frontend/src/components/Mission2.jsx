import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Mission2.css";

// ─────────────────────────────────────────────────────────────────────────────
// World & Player constants
// ─────────────────────────────────────────────────────────────────────────────
const WORLD_W = 1600;
const WORLD_H = 900;

// ─── ZONES PRATICABLES (whitelist) ────────────────────────────────────────────
// Le joueur ne peut se déplacer QUE dans ces rectangles.
// Basé sur l'image missiom2.png (1600x900) — les couloirs rouges.
const WALKABLE_ZONES = [
  { x: 270, y: 740, w: 840, h: 160 }, // couloir principal bas
  { x: 270, y: 490, w: 120, h: 280 }, // allée gauche (entrée → témoin)
  { x: 380, y: 580, w: 260, h: 200 }, // allée centrale (témoin → client 2)
  { x: 840, y: 600, w: 130, h: 170 }, // allée droite (client 2 → client 3)
  { x: 450, y: 680, w: 160, h: 80 },  // jonction centre-bas (devant client 1)
  { x: 100, y: 300, w: 140, h: 250 }, // zone d'entrée / porte
];

// ─── OBJETS BLOQUANTS (blacklist) ──────────────────────────────────────────────
// Les zones où le joueur NE PEUT PAS marcher même si elles sont dans WALKABLE_ZONES.
const COLLISION_OBJECTS = [
  // --- Tables ---
  { x: 190, y: 560, w: 90, h: 40 }, // table_window (témoin)
  { x: 520, y: 700, w: 90, h: 40 }, // table_client1
  { x: 640, y: 640, w: 90, h: 40 }, // table_client2
  { x: 880, y: 700, w: 90, h: 40 }, // table_client3
  { x: 1150, y: 500, w: 380, h: 60 }, // bar_counter
  
  // --- Chaises (décor bloquant) ---
  { x: 150, y: 610, w: 30, h: 20 },
  { x: 480, y: 740, w: 30, h: 20 },
  { x: 600, y: 680, w: 30, h: 20 },
  { x: 840, y: 740, w: 30, h: 20 },
];

// NPCs — positions in world space matching the café image characters (1600x900)
const NPCS = [
  {
    id: "temoin",
    label: "Témoin",
    x: 280,
    y: 480,
    color: "transparent",
    type: "witness",
  },
  {
    id: "client1",
    label: "Client 1",
    x: 500,
    y: 720,
    color: "transparent",
    type: "client",
  },
  {
    id: "client2",
    label: "Client 2",
    x: 750,
    y: 550,
    color: "transparent",
    type: "client",
  },
  {
    id: "client3",
    label: "Client 3",
    x: 1050,
    y: 720,
    color: "transparent",
    type: "client",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dialogue trees
// ─────────────────────────────────────────────────────────────────────────────
const DIALOGUES = {
  client1: {
    type: "linear_with_choice",
    lines: [
      { speaker: "Yanis", text: "Excusez-moi... vous étiez ici hier soir ?" },
      { speaker: "Client 1", text: "Oui. Je viens assez souvent." },
      { speaker: "Yanis", text: "Vous étiez là vers 21h30 ?" },
      { speaker: "Client 1", text: "Oui, je crois. Pourquoi ?" },
      { speaker: "Yanis", text: "Vous avez vu cet homme ?" },
      { speaker: "Client 1", text: "Adam ? Non... désolé. Je ne faisais pas vraiment attention aux autres clients." },
    ],
    choices: [
      {
        label: "Vous étiez assis où ?",
        response: [
          { speaker: "Client 1", text: "Près du comptoir. Je regardais mon téléphone." },
        ],
        clue: null,
      },
      {
        label: "Vous avez remarqué quelque chose d'inhabituel ?",
        response: [
          { speaker: "Client 1", text: "Maintenant que vous le dites... j'ai entendu quelqu'un parler assez fort près de la fenêtre." },
          { speaker: "Yanis", text: "Vous avez vu qui c'était ?" },
          { speaker: "Client 1", text: "Non. Je n'ai pas regardé." },
        ],
        clue: "fenetre",
      },
      {
        label: "D'accord, merci.",
        response: [],
        clue: null,
      },
    ],
  },

  client2: {
    type: "linear_with_choice",
    lines: [
      { speaker: "Yanis", text: "Excusez-moi. Vous étiez ici hier soir ?" },
      { speaker: "Client 2", text: "Oui." },
      { speaker: "Yanis", text: "Vous connaissez Adam ?" },
      { speaker: "Client 2", text: "Adam ?... Oui." },
      { speaker: "Yanis", text: "Vous lui avez parlé ?" },
      { speaker: "Client 2", text: "Peut-être." },
      { speaker: "Yanis", text: "Peut-être ?" },
      { speaker: "Client 2", text: "Je ne me souviens pas exactement." },
      { speaker: "Yanis", text: "Vous venez pourtant de dire que vous le connaissiez." },
      { speaker: "Client 2", text: "Écoutez... je ne vois pas pourquoi vous me posez toutes ces questions." },
    ],
    choices: [
      {
        label: "Vous l'avez rencontré hier. Pourquoi mentir ?",
        response: [
          { speaker: "Client 2", text: "..." },
        ],
        clue: null,
      },
      {
        label: "Vous savez où il était assis ?",
        response: [
          { speaker: "Client 2", text: "À la table 7, je crois." },
          { speaker: "Yanis", text: "Vous en êtes sûr ?" },
          { speaker: "Client 2", text: "...Oui." },
          { speaker: "Client 2", text: "*Il jette un regard rapide vers l'autre client.*" },
        ],
        clue: "table7",
      },
      {
        label: "Très bien. Je vais vous laisser.",
        response: [],
        clue: null,
      },
    ],
  },

  client3: {
    type: "conditional",
    lines: [
      { speaker: "Yanis", text: "Bonsoir. Vous étiez ici hier soir ?" },
      { speaker: "Client 3", text: "Oui." },
      { speaker: "Yanis", text: "Vous connaissez Adam ?" },
      { speaker: "Client 3", text: "Adam ?" },
      { speaker: "Client 3", text: "Non. Je ne connais aucun Adam." },
    ],
    linesWithTicket: [
      { speaker: "Yanis", text: "Bonsoir. Vous étiez ici hier soir ?" },
      { speaker: "Client 3", text: "Oui." },
      { speaker: "Yanis", text: "Vous dites ne pas connaître Adam..." },
      { speaker: "Yanis", text: "...Alors pourquoi votre sac était posé sur la table 7 hier soir ?" },
      { speaker: "Client 3", text: "*regarde le ticket... puis la fenêtre... devient nerveux.*" },
      { speaker: "Client 3", text: "Ce n'était pas mon sac." },
      { speaker: "Yanis", text: "Je viens de vous dire que je l'ai vu." },
      { speaker: "Client 3", text: "Écoutez... je ne veux pas avoir de problèmes." },
      { speaker: "Yanis", text: "Alors dites-moi ce que vous savez." },
      { speaker: "Client 3", text: "...Tu devrais parler à la personne près de la fenêtre." },
      { speaker: "Yanis", text: "Qui ?" },
      { speaker: "Client 3", text: "Elle était avec Adam hier soir." },
    ],
    clue: "temoin_fenetre",
  },

  temoin: {
    type: "choice_start",
    intro: [
      { speaker: "Yanis", text: "Vous connaissez Adam ?" },
      { speaker: "Témoin", text: "*Silence de quelques secondes*" },
      { speaker: "Témoin", text: "Qui t'a envoyé ?" },
    ],
    choices: [
      {
        label: "Je suis son ami.",
        response: [
          { speaker: "Témoin", text: "Alors tu dois déjà savoir qu'Adam avait peur." },
          { speaker: "Yanis", text: "Peur de quoi ?" },
        ],
      },
      {
        label: "Je cherche simplement la vérité.",
        response: [
          { speaker: "Témoin", text: "La vérité peut parfois être dangereuse." },
          { speaker: "Yanis", text: "Je suis prêt à l'entendre." },
        ],
      },
      {
        label: "Lina m'a envoyé.",
        response: [
          { speaker: "Témoin", text: "*regarde Yanis attentivement*" },
          { speaker: "Témoin", text: "Lina..." },
          { speaker: "Témoin", text: "Alors elle t'a finalement envoyé me voir." },
        ],
      },
    ],
    ending: [
      { speaker: "Témoin", text: "Adam était très inquiet hier soir." },
      { speaker: "Yanis", text: "Pourquoi ?" },
      { speaker: "Témoin", text: "Il pensait que quelqu'un le surveillait." },
      { speaker: "Yanis", text: "Qui ?" },
      { speaker: "Témoin", text: "*regarde autour de lui* Je ne sais pas." },
      { speaker: "Témoin", text: "Mais Adam m'a demandé de garder quelque chose pour lui." },
      { speaker: "Yanis", text: "Qu'est-ce que c'était ?" },
      { speaker: "Témoin", text: "*sort lentement une clé USB de sa poche*" },
      { speaker: "Témoin", text: "Prends-la. Tu en auras besoin." },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced Dialogue Component with choices
// ─────────────────────────────────────────────────────────────────────────────
function AdvancedDialogue({ npcId, clues, onComplete, onAddClue }) {
  const data = DIALOGUES[npcId];
  // state machine: 'lines' | 'choices' | 'response' | 'ending' | 'done'
  const [phase, setPhase] = useState("lines");
  const [lineIdx, setLineIdx] = useState(0);
  const [choiceIdx, setChoiceIdx] = useState(null);
  const [responseIdx, setResponseIdx] = useState(0);

  const getLines = () => {
    if (npcId === "client3") {
      return clues.has("table7") ? data.linesWithTicket : data.lines;
    }
    return data.lines || [];
  };

  const currentLines = phase === "lines" ? getLines()
    : phase === "response" && choiceIdx !== null ? (data.choices?.[choiceIdx]?.response || [])
    : phase === "ending" ? (data.ending || [])
    : phase === "intro" ? (data.intro || [])
    : [];

  const currentLine = currentLines[lineIdx] || currentLines[0];

  function advance() {
    if (phase === "lines") {
      if (lineIdx < currentLines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        // Move to choices or done
        if (data.type === "linear_with_choice" && data.choices) {
          setPhase("choices");
          setLineIdx(0);
        } else if (data.type === "conditional") {
          if (npcId === "client3" && clues.has("table7")) {
            onAddClue("temoin_fenetre");
          }
          onComplete();
        } else {
          onComplete();
        }
      }
    } else if (phase === "intro") {
      if (lineIdx < currentLines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        setPhase("choices");
        setLineIdx(0);
      }
    } else if (phase === "response") {
      if (lineIdx < currentLines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        // After response, go to ending if temoin
        if (data.ending) {
          setPhase("ending");
          setLineIdx(0);
        } else {
          onComplete();
        }
      }
    } else if (phase === "ending") {
      if (lineIdx < currentLines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        onComplete();
      }
    }
  }

  function handleChoiceSelect(idx) {
    setChoiceIdx(idx);
    const choice = data.choices[idx];
    if (choice.clue) onAddClue(choice.clue);

    if (choice.response && choice.response.length > 0) {
      setPhase("response");
      setLineIdx(0);
    } else if (data.ending) {
      setPhase("ending");
      setLineIdx(0);
    } else {
      onComplete();
    }
  }

  // Init intro for temoin
  useEffect(() => {
    if (data.type === "choice_start") {
      setPhase("intro");
    }
  }, [data.type]);

  // Key handling
  useEffect(() => {
    if (phase === "choices") return;
    function handleKey(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "e" || e.key === "E") {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (phase === "choices") {
    return (
      <div className="dialogue-box-container">
        <div className="dialogue-box">
          <div className="dialogue-speaker">Yanis</div>
          <div className="dialogue-choices">
            {data.choices.map((c, i) => (
              <button key={i} className="dialogue-choice-btn" onClick={() => handleChoiceSelect(i)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentLine) return null;

  return (
    <div className="dialogue-box-container">
      <div className="dialogue-box">
        <div className="dialogue-speaker">{currentLine.speaker}</div>
        <div className="dialogue-text">{currentLine.text}</div>
        <div className="dialogue-hint">[Entrée] continuer...</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USB Item Obtained Screen
// ─────────────────────────────────────────────────────────────────────────────
function UsbObtained({ onContinue }) {
  return (
    <div className="m2-usb-overlay">
      <div className="m2-usb-card">
        <div className="m2-usb-icon">💾</div>
        <div className="m2-usb-title">OBJET OBTENU</div>
        <div className="m2-usb-name">CLÉ USB</div>
        <div className="m2-usb-desc">« Appartenait à Adam. »</div>
        <button className="m2-usb-btn" onClick={onContinue}>Continuer</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mission Complete Screen
// ─────────────────────────────────────────────────────────────────────────────
function MissionComplete2({ onContinue }) {
  return (
    <div className="m2-complete-overlay">
      <div className="m2-complete-card">
        <div className="m2-complete-check">✓</div>
        <div className="m2-complete-title">MISSION ACCOMPLIE</div>
        <div className="m2-complete-sub">LE RENDEZ-VOUS</div>
        <p>Vous avez retrouvé le témoin d'Adam.</p>
        <div className="m2-complete-reward">Objet récupéré : 💾 CLÉ USB</div>
        <div className="m2-complete-divider" />
        <div className="m2-complete-next">NOUVELLE MISSION DÉBLOQUÉE</div>
        <button className="m2-usb-btn" onClick={onContinue}>Continuer</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Journal Panel
// ─────────────────────────────────────────────────────────────────────────────
const CLUE_LABELS = {
  fenetre:        "Une personne se trouvait près de la fenêtre",
  table7:         "Adam était à la table 7",
  client2_cache:  "Client 2 semble cacher quelque chose",
  temoin_fenetre: "Le témoin est près de la fenêtre",
};

function Journal({ clues, visible, onClose }) {
  if (!visible) return null;
  return (
    <div className="m2-journal-overlay" onClick={onClose}>
      <div className="m2-journal" onClick={e => e.stopPropagation()}>
        <div className="m2-journal-title">JOURNAL</div>
        <ul>
          <li>✓ Adam était au Café Nova</li>
          <li>✓ Heure : 21h30</li>
          {clues.has("table7") && <li>✓ Table : 7</li>}
          {clues.has("fenetre") && <li>✓ Une personne était près de la fenêtre</li>}
          {clues.has("client2_cache") && <li>✓ Client 2 semble cacher quelque chose</li>}
          {clues.has("temoin_fenetre") && <li>✓ Le témoin connaît la personne près de la fenêtre</li>}
        </ul>
        <button className="m2-journal-close" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Mission 2 Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Mission2({ onComplete, addInventoryItem }) {
  const [intro, setIntro] = useState(true);
  const [hoveredNpc, setHoveredNpc] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [clues, setClues] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [showJournal, setShowJournal] = useState(false);

  // end states
  const [showUsb, setShowUsb] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const notifTimer = useRef(null);

  useEffect(() => {
    const h = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  function addClue(clueId) {
    setClues(prev => {
      const next = new Set(prev);
      next.add(clueId);
      return next;
    });
  }

  function showNotif(title, text) {
    setNotification({ title, text });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 4500);
  }

  // Keyboard listeners for journal
  useEffect(() => {
    if (intro || activeDialogue || showUsb || showComplete) return;

    function onKeyDown(e) {
      if (e.key === "j" || e.key === "J") {
        setShowJournal(v => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [intro, activeDialogue, showUsb, showComplete]);

  function handleDialogueComplete() {
    const npc = activeDialogue;
    setActiveDialogue(null);

    if (npc === "client2") {
      addClue("client2_cache");
      showNotif("INDICE OBTENU", "Client 2 semble cacher quelque chose.");
    }
    if (npc === "temoin") {
      addInventoryItem({ id: "usb-key", icon: "USB", name: "Clé USB", detail: "Appartient à Adam" });
      setShowUsb(true);
    }
  }

  // Camera / Scaling
  const scaleX = viewport.w / WORLD_W;
  const scaleY = viewport.h / WORLD_H;
  const scale = Math.max(scaleX, scaleY);
  
  const offsetX = (viewport.w - WORLD_W * scale) / 2;
  const offsetY = (viewport.h - WORLD_H * scale) / 2;



  // Objective text
  const objective = clues.has("temoin_fenetre")
    ? "Retrouvez la personne près de la fenêtre"
    : "Trouvez quelqu'un qui a vu Adam";

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (intro) {
    return (
      <div className="mission2-container">
        <div className="m2-intro-overlay" style={{ backgroundImage: `url(${require("../assets/missiom 2 backgroumd .png")})` }}>
          <div className="m2-intro-text">
            <div className="m2-intro-mission-tag">MISSION 2</div>
            <h2>Le rendez-vous</h2>
            <p>📱 <strong>LINA :</strong> « Adam était ici hier soir à 21h30. Il aurait parlé à quelqu'un. Cherche des indices avant de poser des questions. »</p>
            <div className="m2-intro-objective">Objectif : Trouvez quelqu'un qui a vu Adam.</div>
            <button className="m2-intro-btn" onClick={() => setIntro(false)}>Entrer dans le café →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission2-container">
      {/* Viewport */}
      <div className="m2-viewport">
        {/* World */}
        <div
          className="m2-world"
          style={{
            backgroundImage: `url(${require("../assets/missiom 2 backgroumd .png")})`,
            width: WORLD_W,
            height: WORLD_H,
            transformOrigin: "0 0",
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          }}
        >
          {/* NPCs */}
          {NPCS.map(npc => (
            <div
              key={npc.id}
              className={`m2-npc ${npc.type}`}
              style={{ 
                left: npc.x, 
                top: npc.y, 
                zIndex: Math.floor(npc.y),
                background: npc.color, 
                borderColor: npc.color === "transparent" ? "transparent" : "", 
                boxShadow: npc.color === "transparent" ? "none" : "" 
              }}
              onMouseEnter={() => setHoveredNpc(npc.id)}
              onMouseLeave={() => setHoveredNpc(null)}
              onClick={() => setActiveDialogue(npc.id)}
            >
              <span className="m2-npc-label" style={{ opacity: npc.color === "transparent" ? 0 : 1 }}>{npc.label}</span>
              {hoveredNpc === npc.id && !activeDialogue && (
                <div className="m2-interact-prompt">Clic pour interagir</div>
              )}
            </div>
          ))}
        </div>

        {/* HUD */}
        <div className="m2-hud">
          <div className="m2-hud-title">Objectif</div>
          <div className="m2-hud-objective">{objective}</div>
        </div>

        {/* Journal button */}
        <button className="m2-journal-btn" onClick={() => setShowJournal(v => !v)}>
          Journal [J]
        </button>

        {/* Controls hint */}
        <div className="m2-controls-hint">
          Clic pour interagir avec un personnage · [J] Journal
        </div>
      </div>

      {/* Dialogue */}
      {activeDialogue && (
        <AdvancedDialogue
          key={activeDialogue}
          npcId={activeDialogue}
          clues={clues}
          onComplete={handleDialogueComplete}
          onAddClue={addClue}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className="m2-notification">
          <h3>{notification.title}</h3>
          <p>{notification.text}</p>
        </div>
      )}

      {/* Journal panel */}
      <Journal clues={clues} visible={showJournal} onClose={() => setShowJournal(false)} />

      {/* USB Obtained */}
      {showUsb && (
        <UsbObtained onContinue={() => { setShowUsb(false); setShowComplete(true); }} />
      )}

      {/* Mission Complete */}
      {showComplete && (
        <MissionComplete2 onContinue={onComplete} />
      )}
    </div>
  );
}
