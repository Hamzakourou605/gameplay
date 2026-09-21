import React, { useState } from "react";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Entrez un prénom d'au moins 2 caractères.");
      return;
    }
    onLogin(trimmed.toLowerCase());
  }

  return (
    <div className="login-root">
      <div className="login-bg" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon"><span>LD</span></div>
          <div className="login-logo-text">
            <h1>La Disparition</h1>
            <p>Jeu d'enquête — Chapitre 1</p>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-subtitle">Bienvenue, agent</h2>
        <p className="login-desc">Entrez votre prénom pour commencer.<br/>Votre progression sera sauvegardée automatiquement.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-name">Votre prénom</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="login-name"
                type="text"
                className="login-input"
                placeholder="ex : Yanis, Emma, Karim..."
                value={name}
                maxLength={30}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn">
            Commencer l'enquête
          </button>
        </form>
      </div>
    </div>
  );
}
