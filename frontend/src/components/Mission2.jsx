import React, { useState, useEffect, useRef } from "react";
import DialogueBox from "./DialogueBox";
import "./Mission2.css";

const SPEED = 5;
const PLAYER_SIZE = 40;
const WORLD_WIDTH = 2500;
const WORLD_HEIGHT = 1445;

// Distances
const INTERACT_DIST = 100;

// NPCs
const NPCS = [
  { id: "client1", x: 600, y: 700, type: "client" },
  { id: "client2", x: 1400, y: 450, type: "client" },
  { id: "client3", x: 1900, y: 1000, type: "client" },
  { id: "temoin", x: 300, y: 250, type: "witness" },
];

const DIALOGUES = {
  client1: [
    { speaker: "Yanis", text: "Excusez-moi... Vous connaissez Adam ?" },
    { speaker: "Client", text: "Adam ?" },
    { speaker: "Client", text: "Non, désolé. Je n'ai rien vu." }
  ],
  client2: [
    { speaker: "Yanis", text: "Excusez-moi, je cherche quelqu'un qui s'appelle Adam. Vous l'avez déjà vu ici ?" },
    { speaker: "Client", text: "Adam ?" },
    { speaker: "Client", text: "Oui... je crois que je l'ai vu hier." },
    { speaker: "Yanis", text: "Vous êtes sûr ?" },
    { speaker: "Client", text: "Oui. Il était assis près de cette table." },
    { speaker: "Client", text: "Mais il avait l'air très inquiet." },
    { speaker: "Yanis", text: "Vous savez où il est parti ?" },
    { speaker: "Client", text: "Non. Je ne sais pas." }
  ],
  client3: [
    { speaker: "Yanis", text: "Excusez-moi... Vous connaissez Adam ?" },
    { speaker: "Client", text: "Non." },
    { speaker: "Yanis", text: "Vous ne l'avez jamais vu ?" },
    { speaker: "Client", text: "Je ne connais aucun Adam." }
  ],
  temoin: [
    { speaker: "Yanis", text: "Excusez-moi... Je cherche Adam." },
    { speaker: "Témoin", text: "Adam..." },
    { speaker: "Témoin", text: "Oui. Je l'ai vu hier soir." },
    { speaker: "Yanis", text: "Vous êtes sûr ?" },
    { speaker: "Témoin", text: "Oui. Il était très inquiet. Il regardait constamment autour de lui." },
    { speaker: "Yanis", text: "Vous avez parlé avec lui ?" },
    { speaker: "Témoin", text: "Oui. Il m'a demandé de garder quelque chose pour lui." },
    { speaker: "Témoin", text: "Mais je ne savais pas pourquoi." },
    { speaker: "Yanis", text: "Qu'est-ce qu'il vous a laissé ?" },
    { speaker: "Témoin", text: "Une clé USB." },
    { speaker: "Témoin", text: "Adam m'a demandé de ne faire confiance à personne." },
    { speaker: "Témoin", text: "Il m'a aussi dit que quelqu'un le suivait." },
    { speaker: "Yanis", text: "Quelqu'un le suivait ? Qui ?" },
    { speaker: "Témoin", text: "Je ne sais pas." },
    { speaker: "Témoin", text: "C'est tout ce que je peux vous dire." }
  ]
};

export default function Mission2({ onComplete, addInventoryItem }) {
  const [intro, setIntro] = useState(true);
  
  // Player state
  const [pos, setPos] = useState({ x: 700, y: 700 });
  
  // Interaction state
  const [nearNpc, setNearNpc] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  
  // Progress state
  const [hasUsb, setHasUsb] = useState(false);
  const [notification, setNotification] = useState(null);

  // Viewport state for camera
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Input state
  const keys = useRef({ w: false, a: false, s: false, d: false, z: false, q: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  // Handle keyboard events for movement
  useEffect(() => {
    if (intro || activeDialogue || hasUsb) return;

    function handleKeyDown(e) {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = true;
      if (keys.current.hasOwnProperty(e.key.toLowerCase())) keys.current[e.key.toLowerCase()] = true;
      
      // Interact
      if (e.key === "Enter" && nearNpc) {
        setActiveDialogue(nearNpc);
      }
    }
    function handleKeyUp(e) {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false;
      if (keys.current.hasOwnProperty(e.key.toLowerCase())) keys.current[e.key.toLowerCase()] = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [intro, activeDialogue, nearNpc, hasUsb]);

  const [playerAnim, setPlayerAnim] = useState({ dir: "front", frame: 1, moving: false });
  const animTick = useRef(0);

  // Movement loop
  useEffect(() => {
    if (intro || activeDialogue || hasUsb) return;

    let frameId;
    function loop() {
      let dx = 0; let dy = 0;
      let moving = false;
      let newDir = null;

      if (keys.current.a || keys.current.q || keys.current.ArrowLeft) { dx -= SPEED; moving = true; newDir = "left"; }
      else if (keys.current.d || keys.current.ArrowRight) { dx += SPEED; moving = true; newDir = "right"; }
      else if (keys.current.w || keys.current.z || keys.current.ArrowUp) { dy -= SPEED; moving = true; newDir = "front"; }
      else if (keys.current.s || keys.current.ArrowDown) { dy += SPEED; moving = true; newDir = "front"; }

      if (moving) {
        animTick.current++;
        if (animTick.current > 6) {
          setPlayerAnim(pa => ({
            dir: newDir || pa.dir,
            frame: (pa.frame % 7) + 1, // 1 to 7
            moving: true
          }));
          animTick.current = 0;
        }
      } else {
        setPlayerAnim(pa => pa.moving ? { ...pa, frame: 1, moving: false } : pa);
      }

      if (dx !== 0 || dy !== 0) {
        setPos(prev => {
          let nx = prev.x + dx;
          let ny = prev.y + dy;
          
          if (nx < PLAYER_SIZE/2) nx = PLAYER_SIZE/2;
          if (nx > WORLD_WIDTH - PLAYER_SIZE/2) nx = WORLD_WIDTH - PLAYER_SIZE/2;
          if (ny < PLAYER_SIZE/2) ny = PLAYER_SIZE/2;
          if (ny > WORLD_HEIGHT - PLAYER_SIZE/2) ny = WORLD_HEIGHT - PLAYER_SIZE/2;

          return { x: nx, y: ny };
        });
      }
      
      frameId = requestAnimationFrame(loop);
    }
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [intro, activeDialogue, hasUsb]);

  // Check distance to NPCs
  useEffect(() => {
    if (activeDialogue) return;
    
    let closest = null;
    let minDist = INTERACT_DIST;

    for (const npc of NPCS) {
      const dx = pos.x - npc.x;
      const dy = pos.y - npc.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        closest = npc.id;
      }
    }
    
    if (closest !== nearNpc) {
      setNearNpc(closest);
    }
  }, [pos, activeDialogue, nearNpc]);

  function handleDialogueComplete() {
    const npc = activeDialogue;
    setActiveDialogue(null);
    
    if (npc === "client2") {
      showNotification("INDICE OBTENU", "Adam était au Café Nova hier. Il semblait très inquiet.");
    } else if (npc === "temoin") {
      setHasUsb(true);
      addInventoryItem({ id: "usb-key", icon: "USB", name: "Clé USB", detail: "Appartient à Adam" });
      setTimeout(() => {
        showNotification("MISSION TERMINÉE", "Vous avez retrouvé le témoin et récupéré la clé USB d'Adam.");
        setTimeout(() => {
          onComplete();
        }, 4000);
      }, 500);
    }
  }

  function showNotification(title, text) {
    setNotification({ title, text });
    setTimeout(() => setNotification(null), 4000);
  }

  // Calculate camera position
  let camX = pos.x - viewport.w / 2;
  let camY = pos.y - viewport.h / 2;
  
  if (camX < 0) camX = 0;
  if (camX > WORLD_WIDTH - viewport.w) camX = WORLD_WIDTH - viewport.w;
  if (camY < 0) camY = 0;
  if (camY > WORLD_HEIGHT - viewport.h) camY = WORLD_HEIGHT - viewport.h;

  return (
    <div className="mission2-container">
      {/* Intro Screen */}
      {intro && (
        <div className="m2-intro-overlay" style={{ backgroundImage: `url(${require("../assets/Gemini_Generated_Image_zc8opnzc8opnzc8o.jpg")})` }}>
          <div className="m2-intro-text">
            <h1>MISSION 2</h1>
            <h2>Le rendez-vous</h2>
            <p>Objectif : Retrouver le témoin qui a vu Adam au Café Nova.</p>
            <button className="m2-intro-btn" onClick={() => setIntro(false)}>Entrer dans le café →</button>
          </div>
        </div>
      )}

      {/* Viewport & Game World */}
      <div className="m2-viewport">
        {/* HUD (fixed on screen) */}
        {!intro && (
          <div className="m2-hud">
            <div className="m2-hud-title">Objectif</div>
            <div className="m2-hud-objective">Identifier le témoin</div>
          </div>
        )}

        <div className="m2-world" style={{ 
          backgroundImage: `url(${require("../assets/Gemini_Generated_Image_wf55h9wf55h9wf55.jpg")})`,
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          transform: `translate(${-camX}px, ${-camY}px)`
        }}>


        {/* NPCs */}
        {!intro && NPCS.map(npc => (
          <div key={npc.id} className={`m2-npc ${npc.type}`} style={{ left: npc.x, top: npc.y }}>
            {nearNpc === npc.id && !activeDialogue && (
              <div className="m2-interact-prompt">[Entrée] Parler</div>
            )}
            P
          </div>
        ))}

        {/* Player */}
        {!intro && (() => {
          let folder = "fromt";
          let prefix = "avamt ";
          if (playerAnim.dir === "left" || playerAnim.dir === "right") {
            folder = "left";
            prefix = "left";
          }
          let spriteSrc = null;
          try {
            spriteSrc = require(`../assets/${folder}/${prefix}${playerAnim.frame}.png`);
          } catch(e) {}
          
          const isFlipped = playerAnim.dir === "right";
          
          return (
            <div className="m2-player" style={{ left: pos.x, top: pos.y }}>
              <div className="m2-player-label">Yanis</div>
              {spriteSrc && (
                <img 
                  src={spriteSrc} 
                  alt="Yanis" 
                  className="m2-player-sprite" 
                  style={{ transform: isFlipped ? "scaleX(-1)" : "none" }} 
                />
              )}
            </div>
          );
        })()}
        </div>
      </div>

      {/* Dialogue */}
      {activeDialogue && (
        <DialogueBox 
          lines={DIALOGUES[activeDialogue]} 
          onComplete={handleDialogueComplete} 
        />
      )}

      {/* Notification */}
      {notification && (
        <div className="m2-notification">
          <h3>{notification.title}</h3>
          <p>{notification.text}</p>
        </div>
      )}
    </div>
  );
}
