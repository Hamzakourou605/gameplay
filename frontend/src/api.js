const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
let currentPlayerId = localStorage.getItem("player_id") || "guest";

export function setPlayerId(id) {
  currentPlayerId = id;
  localStorage.setItem("player_id", id);
}

export function getPlayerId() {
  return currentPlayerId;
}

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[API] appel échoué, le jeu continue hors-ligne :", err.message);
    return null;
  }
}

export function getState() {
  return safeFetch(`${API_BASE}/api/state?player_id=${currentPlayerId}`);
}

export function saveState(partialState) {
  return safeFetch(`${API_BASE}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: currentPlayerId, ...partialState }),
  });
}

export function addClue(clue) {
  return safeFetch(`${API_BASE}/api/clue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: currentPlayerId, ...clue }),
  });
}

export function resetProgress() {
  return safeFetch(`${API_BASE}/api/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: currentPlayerId }),
  });
}
