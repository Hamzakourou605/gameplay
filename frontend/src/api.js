const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const PLAYER_ID = "yanis_default";

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
  return safeFetch(`${API_BASE}/api/state?player_id=${PLAYER_ID}`);
}

export function saveState(partialState) {
  return safeFetch(`${API_BASE}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: PLAYER_ID, ...partialState }),
  });
}

export function addClue(clue) {
  return safeFetch(`${API_BASE}/api/clue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: PLAYER_ID, ...clue }),
  });
}

export function resetProgress() {
  return safeFetch(`${API_BASE}/api/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: PLAYER_ID }),
  });
}
