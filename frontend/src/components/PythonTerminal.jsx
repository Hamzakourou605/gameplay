import React, { useEffect, useRef, useState } from "react";

const INITIAL_CODE = `text = "EPJSPO"
result = ""

# TODO: Parcourez chaque lettre de 'text'
# et décalez la d'une position vers la gauche (-1)
# en utilisant chr() et ord()


print(result)`;

const SUCCESS_WORD = "DOIRON";

export default function PythonTerminal({ onSuccess, onClose }) {
  const [pyodide, setPyodide]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [code, setCode]             = useState(INITIAL_CODE);
  const [output, setOutput]         = useState("");
  const [running, setRunning]       = useState(false);
  const [solved, setSolved]         = useState(false);
  const [loadError, setLoadError]   = useState("");
  const [runError, setRunError]     = useState("");
  const [bootLines, setBootLines]   = useState([]);
  const textareaRef                 = useRef(null);

  const BOOT_SEQUENCE = [
    "Initialisation de l'environnement Python...",
    "Chargement du moteur Pyodide v0.24...",
    "Modules disponibles : sys, builtins, math",
    "Prêt.",
  ];

  // Load Pyodide on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Check if already loaded globally
        if (!window.loadPyodide) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        if (cancelled) return;
        const py = await window.loadPyodide();
        if (cancelled) return;
        // Simulate boot sequence
        for (let i = 0; i < BOOT_SEQUENCE.length; i++) {
          await new Promise(r => setTimeout(r, 350));
          if (cancelled) return;
          setBootLines(prev => [...prev, BOOT_SEQUENCE[i]]);
        }
        await new Promise(r => setTimeout(r, 300));
        if (!cancelled) { setPyodide(py); setLoading(false); }
      } catch (e) {
        if (!cancelled) {
          setLoadError("Erreur de chargement de Pyodide. Vérifiez votre connexion.");
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  async function runCode() {
    if (!pyodide || running) return;
    setRunning(true);
    setOutput("");
    setRunError("");
    try {
      // Capture stdout
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
`);
      pyodide.runPython(code);
      const result = pyodide.runPython("sys.stdout.getvalue()");
      pyodide.runPython("sys.stdout = sys.__stdout__");
      const trimmed = result.trim();
      setOutput(trimmed);

      // Check success
      if (trimmed.toUpperCase().includes(SUCCESS_WORD)) {
        setTimeout(() => { setSolved(true); }, 600);
      }
    } catch (e) {
      setRunError(String(e).split("\n").pop() || String(e));
    } finally {
      setRunning(false);
    }
  }

  function handleKeyDown(e) {
    // Tab → insert spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
    }
  }

  return (
    <div className="modal-overlay" style={{ alignItems: "center" }}>
      <div className="pyterm-window">
        {/* ── Title bar ── */}
        <div className="pyterm-titlebar">
          <div className="pyterm-dots">
            <span className="pyterm-dot pyterm-dot--red" onClick={onClose} title="Fermer" />
            <span className="pyterm-dot pyterm-dot--yellow" />
            <span className="pyterm-dot pyterm-dot--green" />
          </div>
          <span className="pyterm-title">PYTHON TERMINAL — Adam's Computer</span>
          <span />
        </div>

        {/* ── Boot sequence ── */}
        {loading && (
          <div className="pyterm-boot">
            {bootLines.map((l, i) => (
              <div key={i} className="pyterm-boot-line">
                <span className="pyterm-boot-prompt">$</span> {l}
              </div>
            ))}
            {bootLines.length < BOOT_SEQUENCE.length && (
              <div className="pyterm-boot-cursor">▌</div>
            )}
            {loadError && <div className="pyterm-error">{loadError}</div>}
          </div>
        )}

        {/* ── Main terminal ── */}
        {!loading && !loadError && (
          <div className="pyterm-body">
            {/* Hint */}
            <div className="pyterm-hint">
              <span className="pyterm-hint-label">INDICE :</span>
              <span className="pyterm-hint-text">
                Décale chaque lettre d'une position vers la gauche dans l'alphabet.
                <br />Le code sur la feuille : <code>4 - 15 - 9 - 18 - 15 - 14</code>
              </span>
            </div>

            {/* Code editor */}
            <div className="pyterm-section-label">CODE</div>
            <textarea
              ref={textareaRef}
              className="pyterm-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              disabled={solved}
            />

            {/* Run button */}
            <button
              className={`pyterm-run-btn ${running ? "pyterm-run-btn--running" : ""}`}
              onClick={runCode}
              disabled={running || solved}
            >
              {running ? "Exécution..." : "EXÉCUTER"}
            </button>

            {/* Output */}
            {(output || runError) && (
              <>
                <div className="pyterm-section-label">OUTPUT</div>
                <div className={`pyterm-output ${solved ? "pyterm-output--success" : ""} ${runError ? "pyterm-output--error" : ""}`}>
                  {runError
                    ? <><span className="pyterm-output-err">Erreur :</span> {runError}</>
                    : <><span className="pyterm-output-prompt">&gt;</span> {output}</>
                  }
                </div>
              </>
            )}

            {/* Success banner */}
            {solved && (
              <div className="pyterm-success">
                <div className="pyterm-success-title">CODE DÉCHIFFRÉ : <strong>{SUCCESS_WORD}</strong></div>
                <div className="pyterm-success-sub">Mot de passe d'Adam trouvé. L'ordinateur est maintenant accessible.</div>
                <button className="pyterm-success-btn" onClick={onSuccess}>
                  Accéder à l'ordinateur →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="pyterm-body">
            <div className="pyterm-error" style={{ textAlign: "center", padding: 32 }}>
              {loadError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
