import { useState, useEffect, useCallback, useRef } from "react";

const GAMES = [
  { id: "home", name: "Início", icon: "🧠" },
  { id: "flexibility", name: "Flexibilidade", icon: "🔄" },
  { id: "inhibition", name: "Controle Inibitório", icon: "🛑" },
  { id: "memory", name: "Memória Operacional", icon: "💭" },
  { id: "fluency", name: "Fluência Verbal", icon: "💬" },
  { id: "planning", name: "Planejamento", icon: "📋" },
  { id: "prosody", name: "Leitura Social", icon: "🎭" },
];

// ============================================
// GAME 1: COGNITIVE FLEXIBILITY (Mini-WCST)
// ============================================
const SHAPES = ["●", "▲", "■", "◆"];
const COLORS = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12"];
const COUNTS = [1, 2, 3, 4];

function generateCard() {
  return {
    shape: Math.floor(Math.random() * 4),
    color: Math.floor(Math.random() * 4),
    count: Math.floor(Math.random() * 4),
  };
}

function FlexibilityGame() {
  const [rule, setRule] = useState(0); // 0=color, 1=shape, 2=count
  const [currentCard, setCurrentCard] = useState(generateCard());
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ruleChanges, setRuleChanges] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [total, setTotal] = useState(0);
  const [showRule, setShowRule] = useState(true);
  const ruleNames = ["COR", "FORMA", "QUANTIDADE"];

  useEffect(() => {
    const t = [0, 1, 2, 3].map(() => generateCard());
    setTargets(t);
  }, []);

  useEffect(() => {
    if (streak > 0 && streak % 5 === 0) {
      const newRule = (rule + 1) % 3;
      setRule(newRule);
      setRuleChanges((p) => p + 1);
      setShowRule(true);
      setTimeout(() => setShowRule(false), 2000);
    }
  }, [streak]);

  const handleMatch = (idx) => {
    const target = targets[idx];
    let correct = false;
    if (rule === 0) correct = target.color === currentCard.color;
    if (rule === 1) correct = target.shape === currentCard.shape;
    if (rule === 2) correct = target.count === currentCard.count;

    setTotal((p) => p + 1);
    if (correct) {
      setScore((p) => p + 1);
      setStreak((p) => p + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setTimeout(() => {
      setFeedback(null);
      setCurrentCard(generateCard());
      setTargets([0, 1, 2, 3].map(() => generateCard()));
    }, 600);
  };

  const renderCard = (card, size = 60, onClick = null) => (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size * 1.3,
        background: "rgba(255,255,255,0.06)",
        border: "2px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        gap: 2,
      }}
    >
      {Array.from({ length: COUNTS[card.count] }).map((_, i) => (
        <span key={i} style={{ color: COLORS[card.color], fontSize: size * 0.3, lineHeight: 1 }}>
          {SHAPES[card.shape]}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 20, padding: "12px 20px", background: showRule ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.05)", borderRadius: 12, border: showRule ? "1px solid rgba(46,204,113,0.4)" : "1px solid rgba(255,255,255,0.1)", transition: "all 0.5s" }}>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>Regra atual</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: showRule ? "#2ECC71" : "#fff" }}>
          Combine por {ruleNames[rule]}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 10, fontSize: 13, opacity: 0.6 }}>
        <span>Acertos: {score}/{total}</span>
        <span>Sequência: {streak}</span>
        <span>Mudanças de regra: {ruleChanges}</span>
      </div>

      {feedback && (
        <div style={{ fontSize: 18, fontWeight: 700, color: feedback === "correct" ? "#2ECC71" : "#E74C3C", marginBottom: 10, animation: "fadeIn 0.3s" }}>
          {feedback === "correct" ? "✓ Correto!" : "✗ Tente novamente"}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>CARTA ATUAL</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {renderCard(currentCard, 80)}
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>ESCOLHA A CARTA CORRESPONDENTE</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        {targets.map((t, i) => (
          <div key={i} style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            {renderCard(t, 65, () => handleMatch(i))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// GAME 2: INHIBITORY CONTROL (Go/No-Go)
// ============================================
function InhibitionGame() {
  const [phase, setPhase] = useState("ready"); // ready, playing, result
  const [stimulus, setStimulus] = useState(null);
  const [score, setScore] = useState({ correct: 0, errors: 0, missed: 0 });
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(20);
  const [feedback, setFeedback] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const timerRef = useRef(null);
  const stimulusTimeRef = useRef(null);

  const startGame = () => {
    setPhase("playing");
    setScore({ correct: 0, errors: 0, missed: 0 });
    setRound(0);
    setReactionTimes([]);
    nextStimulus();
  };

  const nextStimulus = () => {
    const delay = 1000 + Math.random() * 1500;
    setStimulus(null);
    setFeedback(null);

    timerRef.current = setTimeout(() => {
      const isGo = Math.random() > 0.3;
      setStimulus(isGo ? "go" : "nogo");
      stimulusTimeRef.current = Date.now();

      timerRef.current = setTimeout(() => {
        if (isGo) {
          setScore((p) => ({ ...p, missed: p.missed + 1 }));
          setFeedback("miss");
        } else {
          setScore((p) => ({ ...p, correct: p.correct + 1 }));
          setFeedback("goodhold");
        }
        advanceRound();
      }, 1500);
    }, delay);
  };

  const advanceRound = () => {
    setRound((p) => {
      if (p + 1 >= totalRounds) {
        setTimeout(() => setPhase("result"), 800);
        return p + 1;
      }
      setTimeout(nextStimulus, 800);
      return p + 1;
    });
  };

  const handleTap = () => {
    if (phase !== "playing" || !stimulus) return;
    clearTimeout(timerRef.current);
    const rt = Date.now() - stimulusTimeRef.current;

    if (stimulus === "go") {
      setScore((p) => ({ ...p, correct: p.correct + 1 }));
      setReactionTimes((p) => [...p, rt]);
      setFeedback("hit");
    } else {
      setScore((p) => ({ ...p, errors: p.errors + 1 }));
      setFeedback("falsealarm");
    }
    advanceRound();
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const avgRT = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;

  if (phase === "ready") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🟢 🔴</div>
        <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Go / No-Go</h3>
        <p style={{ opacity: 0.7, marginBottom: 8, fontSize: 14, maxWidth: 350, margin: "0 auto 20px" }}>
          Toque <b>rápido</b> quando aparecer o <span style={{ color: "#2ECC71", fontWeight: 700 }}>círculo VERDE</span>.
          <br />
          <b>NÃO toque</b> quando aparecer o <span style={{ color: "#E74C3C", fontWeight: 700 }}>círculo VERMELHO</span>.
        </p>
        <button onClick={startGame} style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #2ECC71, #27AE60)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Iniciar
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const total = score.correct + score.errors + score.missed;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <h3 style={{ marginBottom: 16 }}>Resultado</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 300, margin: "0 auto 20px" }}>
          <div style={{ background: "rgba(46,204,113,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#2ECC71" }}>{score.correct}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Acertos</div>
          </div>
          <div style={{ background: "rgba(231,76,60,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#E74C3C" }}>{score.errors}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Alarmes Falsos</div>
          </div>
          <div style={{ background: "rgba(243,156,18,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#F39C12" }}>{score.missed}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Omissões</div>
          </div>
          <div style={{ background: "rgba(52,152,219,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#3498DB" }}>{avgRT}ms</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Tempo Médio</div>
          </div>
        </div>
        <button onClick={startGame} style={{ padding: "10px 28px", fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer" }}>
          Jogar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }} onClick={handleTap}>
      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8 }}>Rodada {round + 1}/{totalRounds}</div>
      <div style={{ width: 160, height: 160, borderRadius: "50%", margin: "20px auto", display: "flex", alignItems: "center", justifyContent: "center", background: !stimulus ? "rgba(255,255,255,0.05)" : stimulus === "go" ? "radial-gradient(circle, #2ECC71, #1a9c4a)" : "radial-gradient(circle, #E74C3C, #c0392b)", border: !stimulus ? "3px dashed rgba(255,255,255,0.15)" : "3px solid transparent", transition: "all 0.15s", cursor: stimulus ? "pointer" : "default", boxShadow: stimulus ? `0 0 40px ${stimulus === "go" ? "rgba(46,204,113,0.4)" : "rgba(231,76,60,0.4)"}` : "none" }}>
        {!stimulus && <span style={{ opacity: 0.3, fontSize: 14 }}>Aguarde...</span>}
        {stimulus === "go" && <span style={{ fontSize: 28, fontWeight: 700 }}>TOQUE!</span>}
        {stimulus === "nogo" && <span style={{ fontSize: 28, fontWeight: 700 }}>PARE!</span>}
      </div>
      {feedback && (
        <div style={{ fontSize: 16, fontWeight: 600, color: feedback === "hit" || feedback === "goodhold" ? "#2ECC71" : feedback === "miss" ? "#F39C12" : "#E74C3C" }}>
          {feedback === "hit" && "✓ Boa!"}
          {feedback === "goodhold" && "✓ Correto! Não tocou."}
          {feedback === "miss" && "⚠ Muito lento!"}
          {feedback === "falsealarm" && "✗ Não devia ter tocado!"}
        </div>
      )}
    </div>
  );
}

// ============================================
// GAME 3: WORKING MEMORY (Digit Span)
// ============================================
function MemoryGame() {
  const [phase, setPhase] = useState("ready");
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [level, setLevel] = useState(3);
  const [showingIdx, setShowingIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(3);
  const [mode, setMode] = useState("forward"); // forward, backward
  const [feedback, setFeedback] = useState(null);

  const startRound = useCallback(() => {
    const seq = Array.from({ length: level }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(seq);
    setUserInput([]);
    setFeedback(null);
    setPhase("showing");

    seq.forEach((_, i) => {
      setTimeout(() => setShowingIdx(i), i * 800);
    });
    setTimeout(() => {
      setShowingIdx(-1);
      setPhase("input");
    }, seq.length * 800 + 400);
  }, [level]);

  const handleDigit = (d) => {
    if (phase !== "input") return;
    const newInput = [...userInput, d];
    setUserInput(newInput);

    const target = mode === "forward" ? sequence : [...sequence].reverse();
    if (newInput.length === target.length) {
      const correct = newInput.every((v, i) => v === target[i]);
      if (correct) {
        setScore((p) => p + 1);
        setFeedback("correct");
        const newLevel = level + 1;
        setLevel(newLevel);
        if (newLevel > maxLevel) setMaxLevel(newLevel);
        setTimeout(() => startRound(), 1200);
      } else {
        setFeedback("wrong");
        if (level > 3) setLevel((p) => p - 1);
        setTimeout(() => startRound(), 1500);
      }
      setPhase("feedback");
    }
  };

  if (phase === "ready") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔢</div>
        <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Span de Dígitos</h3>
        <p style={{ opacity: 0.7, fontSize: 14, maxWidth: 350, margin: "0 auto 16px" }}>
          Memorize a sequência de números e repita-os{" "}
          {mode === "forward" ? "na mesma ordem" : "na ordem inversa"}.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {["forward", "backward"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: mode === m ? "rgba(52,152,219,0.3)" : "rgba(255,255,255,0.05)", color: "#fff", border: mode === m ? "1px solid rgba(52,152,219,0.5)" : "1px solid rgba(255,255,255,0.15)", borderRadius: 8, cursor: "pointer" }}>
              {m === "forward" ? "Ordem Direta" : "Ordem Inversa"}
            </button>
          ))}
        </div>
        <button onClick={() => { setLevel(3); setScore(0); startRound(); }} style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #3498DB, #2980B9)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Iniciar
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16, fontSize: 13, opacity: 0.6 }}>
        <span>Nível: {level} dígitos</span>
        <span>Acertos: {score}</span>
        <span>Máximo: {maxLevel}</span>
        <span style={{ color: "#3498DB" }}>{mode === "forward" ? "Direta" : "Inversa"}</span>
      </div>

      {phase === "showing" && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>MEMORIZE</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {sequence.map((n, i) => (
              <div key={i} style={{ width: 50, height: 60, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, background: i === showingIdx ? "rgba(52,152,219,0.4)" : "rgba(255,255,255,0.05)", border: i === showingIdx ? "2px solid #3498DB" : "2px solid rgba(255,255,255,0.1)", transition: "all 0.2s", boxShadow: i === showingIdx ? "0 0 20px rgba(52,152,219,0.3)" : "none" }}>
                {i === showingIdx ? n : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {(phase === "input" || phase === "feedback") && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8 }}>
            {mode === "forward" ? "Repita na mesma ordem" : "Repita na ordem INVERSA"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16, minHeight: 50 }}>
            {(mode === "forward" ? sequence : [...sequence].reverse()).map((_, i) => (
              <div key={i} style={{ width: 44, height: 52, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, background: userInput[i] ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.15)" }}>
                {userInput[i] || ""}
              </div>
            ))}
          </div>

          {feedback && (
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: feedback === "correct" ? "#2ECC71" : "#E74C3C" }}>
              {feedback === "correct" ? "✓ Correto!" : `✗ Era: ${mode === "forward" ? sequence.join(" ") : [...sequence].reverse().join(" ")}`}
            </div>
          )}
        </div>
      )}

      {phase === "input" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 56px)", gap: 8, justifyContent: "center" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => handleDigit(n)} style={{ width: 56, height: 56, borderRadius: 10, fontSize: 22, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
              {n}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => { setPhase("ready"); setLevel(3); setScore(0); }} style={{ marginTop: 16, padding: "6px 16px", fontSize: 12, background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, cursor: "pointer" }}>
        Voltar
      </button>
    </div>
  );
}

// ============================================
// GAME 4: VERBAL FLUENCY (Category Switching)
// ============================================
const CATEGORIES = [
  { name: "Animais", emoji: "🐾" },
  { name: "Frutas", emoji: "🍎" },
  { name: "Profissões", emoji: "👷" },
  { name: "Países", emoji: "🌍" },
  { name: "Roupas", emoji: "👕" },
  { name: "Esportes", emoji: "⚽" },
];

function FluencyGame() {
  const [phase, setPhase] = useState("ready");
  const [mode, setMode] = useState("single"); // single, alternating
  const [category, setCategory] = useState(null);
  const [category2, setCategory2] = useState(null);
  const [currentCat, setCurrentCat] = useState(0);
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [intervals, setIntervals] = useState([]);
  const timerRef = useRef(null);

  const startGame = () => {
    const c1 = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    let c2 = c1;
    while (c2 === c1) c2 = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setCategory(c1);
    setCategory2(c2);
    setCurrentCat(0);
    setWords([]);
    setTimeLeft(60);
    setIntervals([]);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const addWord = () => {
    if (!input.trim()) return;
    const elapsed = 60 - timeLeft;
    const cat = mode === "single" ? category : currentCat === 0 ? category : category2;
    setWords((p) => [...p, { word: input.trim(), cat: cat.name, time: elapsed }]);
    setInput("");
    if (mode === "alternating") setCurrentCat((p) => (p === 0 ? 1 : 0));

    const bucket = Math.floor(elapsed / 30);
    setIntervals((p) => {
      const n = [...p];
      n[bucket] = (n[bucket] || 0) + 1;
      return n;
    });
  };

  if (phase === "ready") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Fluência Verbal</h3>
        <p style={{ opacity: 0.7, fontSize: 14, maxWidth: 380, margin: "0 auto 16px" }}>
          Diga o maior número de palavras possível em 60 segundos. No modo alternância, alterne entre duas categorias a cada palavra.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {["single", "alternating"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: mode === m ? "rgba(243,156,18,0.3)" : "rgba(255,255,255,0.05)", color: "#fff", border: mode === m ? "1px solid rgba(243,156,18,0.5)" : "1px solid rgba(255,255,255,0.15)", borderRadius: 8, cursor: "pointer" }}>
              {m === "single" ? "Categoria Única" : "Alternância"}
            </button>
          ))}
        </div>
        <button onClick={startGame} style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #F39C12, #E67E22)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Iniciar
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const first30 = words.filter((w) => w.time <= 30).length;
    const last30 = words.filter((w) => w.time > 30).length;
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Resultado</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 360, margin: "0 auto 20px" }}>
          <div style={{ background: "rgba(243,156,18,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#F39C12" }}>{words.length}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Total</div>
          </div>
          <div style={{ background: "rgba(46,204,113,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#2ECC71" }}>{first30}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>0-30s</div>
          </div>
          <div style={{ background: "rgba(231,76,60,0.15)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: last30 < first30 * 0.5 ? "#E74C3C" : "#3498DB" }}>{last30}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>30-60s</div>
          </div>
        </div>
        {last30 < first30 * 0.5 && (
          <div style={{ fontSize: 13, color: "#F39C12", marginBottom: 12, padding: "8px 16px", background: "rgba(243,156,18,0.1)", borderRadius: 8 }}>
            ⚠ Queda significativa na 2ª metade — trabalhar sustentação do esforço
          </div>
        )}
        <div style={{ maxHeight: 150, overflowY: "auto", marginBottom: 16, padding: 8 }}>
          {words.map((w, i) => (
            <span key={i} style={{ display: "inline-block", padding: "3px 8px", margin: 2, fontSize: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
              {w.word} <span style={{ opacity: 0.4, fontSize: 10 }}>{w.cat}</span>
            </span>
          ))}
        </div>
        <button onClick={() => setPhase("ready")} style={{ padding: "8px 20px", fontSize: 13, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer" }}>
          Jogar novamente
        </button>
      </div>
    );
  }

  const activeCat = mode === "single" ? category : currentCat === 0 ? category : category2;

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 4, color: timeLeft <= 10 ? "#E74C3C" : "#fff" }}>
        {timeLeft}s
      </div>
      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 16 }}>
        <div style={{ width: `${(timeLeft / 60) * 100}%`, height: "100%", background: timeLeft <= 10 ? "#E74C3C" : "#F39C12", borderRadius: 2, transition: "width 1s linear" }} />
      </div>

      <div style={{ padding: "10px 20px", background: "rgba(243,156,18,0.15)", borderRadius: 10, marginBottom: 16, border: "1px solid rgba(243,156,18,0.3)" }}>
        <span style={{ fontSize: 22 }}>{activeCat.emoji}</span>
        <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 8 }}>{activeCat.name}</span>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addWord()} placeholder="Digite uma palavra..." autoFocus style={{ padding: "10px 16px", fontSize: 16, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, outline: "none", width: 220 }} />
        <button onClick={addWord} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, background: "rgba(243,156,18,0.3)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          +
        </button>
      </div>

      <div style={{ fontSize: 14, opacity: 0.5 }}>Palavras: {words.length}</div>
    </div>
  );
}

// ============================================
// GAME 5: PLANNING (Sequence Ordering)
// ============================================
const SCENARIOS = [
  {
    title: "Preparar o café da manhã",
    steps: ["Pegar a xícara no armário", "Ferver a água", "Colocar o pó de café no filtro", "Despejar a água quente no filtro", "Servir o café na xícara", "Adicionar açúcar e mexer"],
  },
  {
    title: "Ir ao supermercado",
    steps: ["Verificar o que falta em casa", "Fazer uma lista de compras", "Pegar as sacolas reutilizáveis", "Ir até o supermercado", "Escolher os produtos da lista", "Pagar no caixa", "Guardar as compras em casa"],
  },
  {
    title: "Enviar um e-mail importante",
    steps: ["Abrir o aplicativo de e-mail", "Clicar em novo e-mail", "Digitar o endereço do destinatário", "Escrever o assunto", "Redigir o conteúdo da mensagem", "Revisar o texto", "Clicar em enviar"],
  },
];

function PlanningGame() {
  const [phase, setPhase] = useState("ready");
  const [scenario, setScenario] = useState(null);
  const [shuffled, setShuffled] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const startGame = () => {
    const s = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setScenario(s);
    const sh = [...s.steps].sort(() => Math.random() - 0.5);
    setShuffled(sh);
    setUserOrder([]);
    setFeedback(null);
    setPhase("playing");
  };

  const selectStep = (step) => {
    if (userOrder.includes(step)) return;
    const newOrder = [...userOrder, step];
    setUserOrder(newOrder);

    if (newOrder.length === scenario.steps.length) {
      const correct = newOrder.every((s, i) => s === scenario.steps[i]);
      setTotal((p) => p + 1);
      if (correct) {
        setScore((p) => p + 1);
        setFeedback("correct");
      } else {
        setFeedback("wrong");
      }
      setPhase("feedback");
    }
  };

  const removeStep = (idx) => {
    setUserOrder((p) => p.slice(0, idx));
  };

  if (phase === "ready") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Planejamento de Sequência</h3>
        <p style={{ opacity: 0.7, fontSize: 14, maxWidth: 380, margin: "0 auto 16px" }}>
          Organize os passos na ordem correta para completar a atividade.
        </p>
        <button onClick={startGame} style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #9B59B6, #8E44AD)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Iniciar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.5 }}>Organize na ordem correta</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{scenario?.title}</div>
        {score + total > 0 && <div style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>Acertos: {score}/{total}</div>}
      </div>

      {phase === "feedback" && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: feedback === "correct" ? "#2ECC71" : "#E74C3C", marginBottom: 8 }}>
            {feedback === "correct" ? "✓ Sequência perfeita!" : "✗ Ordem incorreta"}
          </div>
          {feedback === "wrong" && (
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
              Ordem correta:
              {scenario.steps.map((s, i) => (
                <div key={i} style={{ fontSize: 12, padding: "2px 0", opacity: 0.6 }}>{i + 1}. {s}</div>
              ))}
            </div>
          )}
          <button onClick={startGame} style={{ padding: "8px 20px", fontSize: 13, background: "rgba(155,89,182,0.3)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Próximo cenário
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          {userOrder.length > 0 && (
            <div style={{ marginBottom: 12, padding: 10, background: "rgba(155,89,182,0.08)", borderRadius: 10, border: "1px solid rgba(155,89,182,0.2)" }}>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>SUA SEQUÊNCIA</div>
              {userOrder.map((s, i) => (
                <div key={i} onClick={() => removeStep(i)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, background: "rgba(155,89,182,0.15)", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: "#9B59B6", minWidth: 20 }}>{i + 1}.</span>
                  <span>{s}</span>
                  <span style={{ marginLeft: "auto", opacity: 0.3, fontSize: 11 }}>✕</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>PASSOS DISPONÍVEIS</div>
            {shuffled.filter((s) => !userOrder.includes(s)).map((s, i) => (
              <div key={i} onClick={() => selectStep(s)} style={{ padding: "8px 12px", marginBottom: 4, background: "rgba(255,255,255,0.06)", borderRadius: 8, cursor: "pointer", fontSize: 13, border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
                {s}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// GAME 6: SOCIAL READING (Emotion/Context)
// ============================================
const SOCIAL_SCENARIOS = [
  {
    situation: "Seu amigo acabou de contar que foi demitido. Ele diz com um sorriso forçado: 'Tá tudo bem, eu já esperava isso.'",
    question: "Como seu amigo provavelmente está se sentindo?",
    options: ["Aliviado e feliz", "Triste e tentando disfarçar", "Indiferente", "Com raiva de você"],
    correct: 1,
    explanation: "O sorriso forçado indica que ele está tentando esconder a tristeza. Dizer que 'já esperava' é uma forma de proteção emocional."
  },
  {
    situation: "No almoço de família, sua tia pergunta pela terceira vez: 'E o trabalho, como vai?' Seu tom é insistente.",
    question: "O que a tia provavelmente quer saber de verdade?",
    options: ["Se você está ganhando bem", "Se você está feliz na vida em geral", "Ela está sendo educada apenas", "Ela quer que você trabalhe com ela"],
    correct: 1,
    explanation: "A insistência sugere preocupação genuína. 'Trabalho' é frequentemente usado como proxy para perguntar sobre o bem-estar geral."
  },
  {
    situation: "Você conta uma piada e todos riem, exceto uma pessoa que olha para baixo e mexe no celular.",
    question: "Qual é a melhor interpretação?",
    options: ["A pessoa não entendeu a piada", "A pessoa pode estar desconfortável ou preocupada com algo", "A pessoa te odeia", "A pessoa é mal-educada"],
    correct: 1,
    explanation: "Olhar para baixo e mexer no celular pode indicar desconforto, preocupação com algo pessoal, ou distração — não necessariamente relacionado a você."
  },
  {
    situation: "Seu chefe diz: 'Interessante a sua abordagem nesse projeto...' e faz uma pausa longa.",
    question: "O que essa pausa provavelmente indica?",
    options: ["Ele está impressionado positivamente", "Ele tem ressalvas mas está escolhendo as palavras", "Ele não se importa", "Ele vai te promover"],
    correct: 1,
    explanation: "A pausa longa após 'interessante' geralmente sinaliza que há uma crítica ou sugestão de melhoria vindo a seguir. É uma forma educada de introduzir feedback construtivo."
  },
  {
    situation: "Sua esposa diz 'Pode ir, não tem problema' quando você pede para sair com amigos, mas ela cruza os braços e desvia o olhar.",
    question: "O que a linguagem corporal sugere?",
    options: ["Ela realmente não se importa", "Ela está incomodada mas não quer gerar conflito", "Ela está com frio", "Ela está feliz por ter a casa só para ela"],
    correct: 1,
    explanation: "Braços cruzados + desvio de olhar contradizem as palavras. A comunicação não-verbal frequentemente revela o sentimento real quando conflita com o verbal."
  },
];

function ProsodyGame() {
  const [phase, setPhase] = useState("ready");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const startGame = () => {
    setPhase("playing");
    setScenarioIdx(0);
    setScore(0);
    setTotal(0);
    setSelected(null);
    setShowExplanation(false);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTotal((p) => p + 1);
    if (idx === SOCIAL_SCENARIOS[scenarioIdx].correct) {
      setScore((p) => p + 1);
    }
    setShowExplanation(true);
  };

  const nextScenario = () => {
    if (scenarioIdx + 1 >= SOCIAL_SCENARIOS.length) {
      setPhase("result");
    } else {
      setScenarioIdx((p) => p + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  if (phase === "ready") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
        <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Leitura Social</h3>
        <p style={{ opacity: 0.7, fontSize: 14, maxWidth: 380, margin: "0 auto 16px" }}>
          Leia a situação e interprete o que a pessoa realmente está sentindo ou comunicando, além das palavras.
        </p>
        <button onClick={startGame} style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #E74C3C, #C0392B)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Iniciar
        </button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <h3 style={{ marginBottom: 16 }}>Resultado</h3>
        <div style={{ fontSize: 36, fontWeight: 700, color: score >= total * 0.7 ? "#2ECC71" : "#F39C12", marginBottom: 8 }}>
          {score}/{total}
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 20 }}>
          {score >= total * 0.8 ? "Excelente leitura social!" : score >= total * 0.5 ? "Bom, mas há espaço para melhorar!" : "Continue praticando a leitura de contextos sociais."}
        </div>
        <button onClick={startGame} style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, background: "rgba(231,76,60,0.3)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Jogar novamente
        </button>
      </div>
    );
  }

  const s = SOCIAL_SCENARIOS[scenarioIdx];

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, opacity: 0.5 }}>
        <span>Cenário {scenarioIdx + 1}/{SOCIAL_SCENARIOS.length}</span>
        <span>Acertos: {score}/{total}</span>
      </div>

      <div style={{ background: "rgba(231,76,60,0.08)", padding: 16, borderRadius: 12, border: "1px solid rgba(231,76,60,0.2)", marginBottom: 16, fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>
        "{s.situation}"
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{s.question}</div>

      {s.options.map((opt, i) => (
        <div key={i} onClick={() => handleAnswer(i)} style={{ padding: "10px 14px", marginBottom: 6, borderRadius: 8, fontSize: 14, cursor: selected === null ? "pointer" : "default", background: selected === null ? "rgba(255,255,255,0.06)" : i === s.correct ? "rgba(46,204,113,0.2)" : i === selected ? "rgba(231,76,60,0.2)" : "rgba(255,255,255,0.03)", border: selected === null ? "1px solid rgba(255,255,255,0.12)" : i === s.correct ? "1px solid rgba(46,204,113,0.4)" : i === selected ? "1px solid rgba(231,76,60,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.3s" }}>
          {opt}
          {selected !== null && i === s.correct && " ✓"}
          {selected !== null && i === selected && i !== s.correct && " ✗"}
        </div>
      ))}

      {showExplanation && (
        <div style={{ marginTop: 12, padding: 12, background: "rgba(52,152,219,0.1)", borderRadius: 10, border: "1px solid rgba(52,152,219,0.2)", fontSize: 13, lineHeight: 1.5 }}>
          <strong>💡 Por quê?</strong> {s.explanation}
        </div>
      )}

      {selected !== null && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={nextScenario} style={{ padding: "8px 24px", fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer" }}>
            {scenarioIdx + 1 >= SOCIAL_SCENARIOS.length ? "Ver Resultado" : "Próximo →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// HOME SCREEN
// ============================================
function HomeScreen({ onSelect }) {
  const gameCards = [
    { id: "flexibility", icon: "🔄", name: "Flexibilidade Cognitiva", desc: "Adapte-se a mudanças de regra", color: "#2ECC71", target: "Rigidez cognitiva / WCST" },
    { id: "inhibition", icon: "🛑", name: "Controle Inibitório", desc: "Responda rápido, mas só quando deve", color: "#E74C3C", target: "Impulsividade / Go-NoGo" },
    { id: "memory", icon: "💭", name: "Memória Operacional", desc: "Memorize e manipule sequências", color: "#3498DB", target: "Span de dígitos" },
    { id: "fluency", icon: "💬", name: "Fluência Verbal", desc: "Gere palavras contra o relógio", color: "#F39C12", target: "Fluência fonêmica/semântica" },
    { id: "planning", icon: "📋", name: "Planejamento", desc: "Organize passos na ordem certa", color: "#9B59B6", target: "Sequenciamento / FE" },
    { id: "prosody", icon: "🎭", name: "Leitura Social", desc: "Interprete contextos e emoções", color: "#E74C3C", target: "Pragmática / Teoria da Mente" },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Reabilitação Cognitiva</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Exercícios Interativos</h2>
        <p style={{ fontSize: 13, opacity: 0.5, marginTop: 6 }}>Baseados no perfil neuropsicológico individual</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {gameCards.map((g) => (
          <div key={g.id} onClick={() => onSelect(g.id)} style={{ padding: 16, background: `rgba(255,255,255,0.04)`, borderRadius: 14, border: `1px solid ${g.color}22`, cursor: "pointer", transition: "all 0.25s" }} onMouseEnter={(e) => { e.currentTarget.style.background = `${g.color}18`; e.currentTarget.style.borderColor = `${g.color}44`; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = `${g.color}22`; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{g.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{g.name}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>{g.desc}</div>
            <div style={{ fontSize: 10, padding: "2px 8px", display: "inline-block", background: `${g.color}15`, color: g.color, borderRadius: 4 }}>{g.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function CognitiveRehab() {
  const [currentGame, setCurrentGame] = useState("home");

  const renderGame = () => {
    switch (currentGame) {
      case "flexibility": return <FlexibilityGame />;
      case "inhibition": return <InhibitionGame />;
      case "memory": return <MemoryGame />;
      case "fluency": return <FluencyGame />;
      case "planning": return <PlanningGame />;
      case "prosody": return <ProsodyGame />;
      default: return <HomeScreen onSelect={setCurrentGame} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0e17 0%, #131a2b 40%, #1a1428 100%)", color: "#e8e6e3", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", padding: "0 0 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {currentGame !== "home" && (
          <button onClick={() => setCurrentGame("home")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            ← Voltar
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>NeuroExercise</span>
        </div>
        {currentGame !== "home" && (
          <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.4 }}>
            {GAMES.find((g) => g.id === currentGame)?.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.4s ease" }}>
        {renderGame()}
      </div>
    </div>
  );
}
