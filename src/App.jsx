import { useState, useEffect, useRef, useMemo } from "react";
import { TRANSLATIONS } from "./data/translations.js";
import { BADGE_DEFS } from "./data/badges.js";
import "./styles/app.css";
import { FB, FIREBASE_READY, logEvent } from "./services/firebase.js";
import { THEMES, applyTheme } from "./data/themes.js";
import {
  LEVELS, getLevelName, getLevelInfo, calcXpGain,
  getTournamentWeek, getDailyChallenge,
  CAT_LABELS, getCatLabel,
  FREE_CATS, PRO_CATS, ALL_BASE,
  ROUNDS_OPTIONS, DIFFICULTY, AI_NAMES, COUNTRIES,
  TIER, ALPHABET, DAILY_CAT_POOL,
} from "./data/gameConfig.js";
import {
  normalizeWord, collapseDoubles,
  getSets, getFuzzySets, looksLikeRealName, OPEN_CATS,
  isApproxAnswer, isValidAnswer,
  AI_ANSWERS, DAILY_CAT_WORDS, getAiAnswer,
  scoreAnswerTournoi, scoreAnswer, genCode,
} from "./utils/wordValidation.js";
import { Haptics, sanitizeName, SoundFX } from "./utils/sound.js";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

// ═══════════════════════════════════════════════════════════════════
//  LE PETIT BAC — Application mobile (App Store / Google Play)
//  Version : 1.0.0
//  Bundle ID (iOS) : com.petitbac.app
//  Package (Android) : com.petitbac.app
//  Auteur : Petit Bac Studios
//  Licence : Propriétaire — Tous droits réservés © 2024
//  Contact : contact@petitbac.app
//
//  Dépendances open-source :
//    • React (MIT) — facebook.github.io/react
//    • Firebase SDK (Apache 2.0) — firebase.google.com
//    • Web Audio API (W3C Standard)
//
//  Politique de confidentialité : https://petitbac.app/privacy
//  Conditions d'utilisation : https://petitbac.app/terms
//
//  Pour activer le multijoueur, voir GUIDE_FIREBASE.md
// ═══════════════════════════════════════════════════════════════════

// ─── CONFIG ──────────────────────────────────────────────────────
// Voir .env.example pour les variables d'environnement requises

function useT(lang) {
  return useMemo(() => (key, fallback) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    return t[key] || fallback || key;
  }, [lang]);
}

// ─── XP & NIVEAUX ────────────────────────────────────────────────
// ─── NORMALISATION (accents, casse, tirets) ────────────────────────

// ─── CSS ─────────────────────────────────────────────────────────
// ─── ERROR BOUNDARY ───────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [screen, setScreen] = useState("home");
  // BUG FIX: persister le tier PRO/VIP — sans ça, un abonnement (même en mode
  // démo) redevenait "gratuit" à chaque rechargement de page.
  const [tier, setTier] = useState(() => {
    try { return localStorage.getItem("pb_tier") || "free"; } catch { return "free"; }
  });
  useEffect(() => {
    try { localStorage.setItem("pb_tier", tier); } catch { /* ignore */ }
  }, [tier]);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("pb_theme") || "light"; } catch { return "light"; } });
  const [lang, setLang] = useState(() => {
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem("pb_lang") || "fr";
    } catch { /* ignore */ }
    return "fr";
  });
  const t = useT(lang);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { difficulty:"medium", categories:FREE_CATS.map(c=>c.id), customCategories:[], playerName:"", country:"France", totalRounds:5, soundEnabled:true, ...parsed };
      }
    } catch { /* ignore */ }
    const savedName = localStorage.getItem("pb_name") || "";
    return { difficulty:"medium", categories:FREE_CATS.map(c=>c.id), customCategories:[], playerName:savedName, country:"France", totalRounds:5, soundEnabled:true };
  });
  const [gameState, setGameState] = useState(null);
  // BUG 3 FIX: Initialize from localStorage
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_stats");
      return saved ? JSON.parse(saved) : { played: 0, won: 0, best: 0, total: 0, streak: 0, totalWords: 0, uniqueWords: 0 };
    } catch {
      return { played: 0, won: 0, best: 0, total: 0, streak: 0, totalWords: 0, uniqueWords: 0 };
    }
  });
  const [xp, setXp] = useState(() => {
    try { return Number(localStorage.getItem("pb_xp")) || 0; } catch { return 0; }
  });
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_badges");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newBadges, setNewBadges] = useState([]); // badges just unlocked → show notification
  const [showTier, setShowTier] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => { try { const n = localStorage.getItem('pb_name'); return !n || !n.trim(); } catch { return true; } });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_daily")); } catch { return null; }
  });
  const [showBugReport, setShowBugReport] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [showLegal, setShowLegal] = useState(null); // "cgu" | "privacy" | null
  const [profilePhoto, setProfilePhoto] = useState(() => { try { return JSON.parse(localStorage.getItem("pb_photo")); } catch { return null; } }); // { type, data/emoji, bg }
  const [uid, setUid] = useState(null);
  // Friends system
  const [myFriendCode, setMyFriendCode] = useState(() => {
    try { return localStorage.getItem("pb_friendcode") || ""; } catch { return ""; }
  });
  const [friends, setFriends] = useState({});
  const [friendRequests, setFriendRequests] = useState({});
  const [showFriends, setShowFriends] = useState(false);
  // Profile data
  const [wordHistory, setWordHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_words") || "[]"); } catch { return []; }
  });
  const [catHistory, setCatHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_cats") || "{}"); } catch { return {}; }
  });

  // Memoize heavy computations that depend on stable values
  const levelInfo = useMemo(() => getLevelInfo(xp || 0, lang), [xp, lang]);
  const tournament = useMemo(() => getTournamentWeek(), []);
  const daily = useMemo(() => getDailyChallenge(), []);

  const signedInRef = useRef(false);
  useEffect(() => {
    if (signedInRef.current) return; // Guard against StrictMode double-invoke
    signedInRef.current = true;
    FB.signIn().then(u => setUid(u.uid));
  }, []);

  // Le tier PRO/VIP réel est décidé par le webhook Stripe côté serveur
  // (users/{uid}/tier, non modifiable par le client — cf. database.rules.json).
  // On l'écoute en temps réel pour refléter un vrai paiement confirmé, en plus
  // du mode démo local (pb_tier) utilisé quand aucune souscription Stripe
  // réelle n'existe encore pour cet uid.
  useEffect(() => {
    if (!uid || !FB.db) return;
    const unsub = FB.listenUserTier?.(uid, (serverTier) => {
      if (serverTier) setTier(serverTier);
    });
    return () => { if (unsub) unsub(); };
  }, [uid]);

  // Apply theme whenever it changes
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Persist language preference (in-memory for web, localStorage for native)
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem("pb_lang", lang);
    } catch { /* ignore */ }
    try { document.documentElement.lang = lang; } catch { /* ignore */ }
  }, [lang]);

  // Sauvegarder settings (nom, pays, difficulté...) à chaque changement
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pb_settings", JSON.stringify(settings));
        if (settings.playerName) localStorage.setItem("pb_name", settings.playerName);
      }
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem("pb_theme", theme);
    } catch { /* ignore */ }
  }, [theme]);

  // ── Friend system initialization ──────────────────────────────
  // Intentional: runs once on uid change; ongoing name/xp sync is handled by the effect below
  useEffect(() => {
    if (!uid) return;
    FB.getFriendCode(uid).then(code => {
      setMyFriendCode(code);
      FB.syncUserProfile(uid, settings.playerName, xp);
    });
    // Listen for incoming friend requests in real-time
    const unsubReq = FB.listenFriendRequests(uid, setFriendRequests);
    // Listen for friend list in real-time
    const unsubFriends = FB.listenFriends(uid, setFriends);
    return () => { unsubReq(); unsubFriends(); };
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync player name/XP to Firebase users profile
  useEffect(() => {
    if (!uid || !myFriendCode) return;
    FB.syncUserProfile(uid, settings.playerName, xp);
  }, [settings.playerName, xp, uid, myFriendCode]);

  function goSetup(mode) { setGameState({ mode }); setScreen("setup"); }
  function goOnline(mode) {
    setGameState({ mode });
    setScreen("online");
  }

  function startTournamentGame() {
    const tournament = getTournamentWeek(); // recompute to avoid stale value after midnight
    const activeCats = tournament.cats;
    const players = [
      { id: uid || "human", name: settings.playerName || "Joueur", isBot: false, answers: {}, done: false },
    ];
    setGameState({
      mode: "tournoi",
      difficulty: "hard",
      totalTime: DIFFICULTY.hard.time,
      timeLeft: DIFFICULTY.hard.time,
      categories: activeCats,
      players,
      totalRounds: 1,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter: tournament.letter,
      answers: Object.fromEntries(activeCats.map(c => [c.id, ""])),
      phase: "playing",
      cumulativeScores: { [uid || "human"]: 0 },
      myId: uid || "human",
      isTournoi: true,
      weekNum: tournament.weekNum,
      lang: lang,
    });
    setScreen("game");
  }

  function startDailyChallenge() {
    const daily = getDailyChallenge(); // recompute to avoid stale value after midnight
    const { cats, letter } = daily;
    // Daily uses special categories + hard difficulty + 1 round
    const activeCats = cats.map(c => ({ ...c, tier: "pro" }));
    const players = [
      { id: "human", name: settings.playerName, isBot: false, answers: {}, done: false },
      { id: "bot0",  name: "Bot Elite",          isBot: true,  answers: {}, done: false },
    ];
    setGameState({
      mode: "daily",
      difficulty: "hard",
      totalTime: DIFFICULTY.hard.time,
      timeLeft: DIFFICULTY.hard.time,
      categories: activeCats,
      players,
      totalRounds: 1,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter,
      answers: Object.fromEntries(activeCats.map(c => [c.id, ""])),
      phase: "playing",
      cumulativeScores: Object.fromEntries(players.map(p => [p.id, 0])),
      myId: "human",
      isDaily: true,
      lang: lang,
      dailyLetter: letter,
    });
    setScreen("game");
  }

  function startSoloGame(cfg) {
    const activeCats = cfg.categories.map(id =>
      [...ALL_BASE, ...cfg.customCategories].find(c => c.id === id)
    ).filter(Boolean);
    const humanId = uid || "human";
    const is2v2 = cfg.mode === "2v2";
    const isMort = cfg.mode === "mort";

    // Mort subite: 4 joueurs (plus de challenge)
    // 2v2: 4 joueurs en 2 équipes
    // Noms des bots supplémentaires
    const BOT_NAMES = [...AI_NAMES, "Bot Sam", "Bot Léa", "Bot Tom"];

    const players = is2v2 || isMort ? [
      { id: humanId, name: cfg.playerName, isBot: false, answers: {}, done: false, eliminated: false },
      { id: "bot0", name: BOT_NAMES[0], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot1", name: BOT_NAMES[1], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot2", name: BOT_NAMES[2], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot3", name: BOT_NAMES[3], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot4", name: BOT_NAMES[4], isBot: true, answers: {}, done: false, eliminated: false },
    ] : [
      { id: humanId, name: cfg.playerName, isBot: false, answers: {}, done: false },
      { id: "bot0", name: BOT_NAMES[0], isBot: true, answers: {}, done: false },
      { id: "bot1", name: BOT_NAMES[1], isBot: true, answers: {}, done: false },
    ];

    // Équipes 2v2: formées aléatoirement au début de partie
    let teams = null;
    if (is2v2) {
      const allIds = [...players.map(p => p.id)];
      // Mélange Fisher-Yates
      for (let i = allIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
      }
      const half = Math.ceil(allIds.length / 2);
      teams = { team0: allIds.slice(0, half), team1: allIds.slice(half) };
    }


    // Mort Subite: tirer les catégories actives de ce 1er round
    const mortCatCount = isMort && cfg.mortCatCount ? cfg.mortCatCount : null;
    function pickMortCats(pool, n) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(n, shuffled.length));
    }
    const activeCategories = mortCatCount ? pickMortCats(activeCats, mortCatCount) : activeCats;

    setGameState({
      mode: cfg.mode || "solo",
      difficulty: cfg.difficulty,
      totalTime: DIFFICULTY[cfg.difficulty].time,
      timeLeft: DIFFICULTY[cfg.difficulty].time,
      categories: activeCats,         // pool complet
      activeCategories,               // catégories jouées ce round
      mortCatCount,                   // nb cats/manche pour mort subite
      players,
      totalRounds: cfg.totalRounds,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter: null,
      answers: Object.fromEntries(activeCategories.map(c => [c.id, ""])),
      phase: "roulette",
      cumulativeScores: Object.fromEntries(players.map(p => [p.id, 0])),
      myId: humanId,
      teams: teams,
      lang: lang,
      usedLetters: [],
    });
    setScreen("game");
    logEvent("game_start", { uid, mode: cfg.mode, difficulty: cfg.difficulty });
  }

  function enterOnlineGame(roomCode, roomData, myUid) {
    const allCats = (roomData.settings.categories || []).map(id =>
      ALL_BASE.find(c => c.id === id)
    ).filter(Boolean);
    // Mort subite: appliquer les catégories actives du 1er round si broadcastées
    const activeCatIds = roomData.activeCategoryIds;
    const activeCats = activeCatIds
      ? activeCatIds.map(id => ALL_BASE.find(c => c.id === id)).filter(Boolean)
      : allCats;
    const totalTime = DIFFICULTY[roomData.settings.difficulty || "medium"].time;
    // RECONNEXION: si la partie est déjà en cours (round_ended/vote_phase/playing),
    // reprendre à l'écran de jeu plutôt que de toujours repartir de la roulette —
    // sinon un joueur qui rejoint après un rechargement de page revit une roulette
    // fantôme au lieu de reprendre le round réellement en cours.
    const resumePhase = roomData.phase === "roulette" ? "roulette" : "playing";
    let timeLeft = totalTime;
    if (resumePhase === "playing" && roomData.letterChosenAt) {
      const elapsedSec = Math.floor((Date.now() - roomData.letterChosenAt) / 1000);
      timeLeft = Math.max(5, totalTime - elapsedSec);
    }
    setGameState({
      mode: roomData.settings?.gameMode || "online",
      roomCode,
      difficulty: roomData.settings.difficulty || "medium",
      totalTime,
      timeLeft,
      categories: allCats,
      activeCategories: activeCats,
      players: Object.values(roomData.players || {}).map(p => ({ ...p, id: p.uid || p.id })),
      totalRounds: roomData.settings.totalRounds || 5,
      currentRound: roomData.currentRound || 1,
      spinnerIndex: roomData.spinnerIndex || 0,
      spinnerOrder: roomData.spinnerOrder || null,
      rounds: [],
      letter: resumePhase === "playing" ? (roomData.letter || null) : null,
      pendingLetter: roomData.letter || null,
      answers: Object.fromEntries(activeCats.map(c => [c.id, roomData.playerAnswers?.[myUid]?.[c.id] || ""])),
      phase: resumePhase,
      cumulativeScores: roomData.cumulativeScores || {},
      // BUG FIX: utiliser l'uid résolu au moment de créer/rejoindre la room (myUid),
      // pas le state top-level "uid" qui peut ne pas encore avoir résolu (async signIn).
      // Sinon myId reste null → handleStop bascule silencieusement en mode offline
      // et n'écrit jamais les réponses du joueur sur Firebase.
      myId: myUid || uid,
      // Utiliser les équipes broadcastées par l'hôte via Firebase (évite la divergence 2v2)
      teams: roomData.teams || (roomData.settings?.gameMode === "2v2" ? (() => {
        const playerIds = Object.keys(roomData.players || {});
        const half = Math.ceil(playerIds.length / 2);
        return { team0: playerIds.slice(0, half), team1: playerIds.slice(half) };
      })() : null),
      isHost: roomData.hostId === (myUid || uid),
      lang: lang, // BUG 6 FIX: include lang in online game state
      usedLetters: roomData.usedLetters || [], // BUG 3 FIX: restaurer les lettres déjà utilisées
      mortCatCount: roomData.settings?.mortCatCount || null, // Mort subite: nb cats/manche
    });
    setScreen("game");
  }

  // BUG 2 FIX: handleGameEnd updates stats, XP, badges and persists to localStorage
  function handleGameEnd(gs) {
    // La partie est réellement terminée — ne plus proposer de la reprendre au reload
    try { localStorage.removeItem("pb_active_room"); } catch { /* ignore */ }
    setGameState(gs);
    setScreen("results");

    const myId = gs.myId || uid || "human";
    const myScore = gs.cumulativeScores?.[myId] || 0;
    const allScores = Object.values(gs.cumulativeScores || {});
    const maxScore = Math.max(...allScores);
    const won = myScore >= maxScore && allScores.filter(s => s === maxScore).length === 1;

    // Collect words submitted this game
    const newWords = [];
    (gs.rounds || []).forEach(round => {
      Object.entries(round.answers || {}).forEach(([, catAnswers]) => {
        const a = catAnswers?.[myId];
        if (a?.trim()) newWords.push(a.trim().toLowerCase());
      });
    });
    const wordsThisGame = newWords.length;

    // Update word history
    setWordHistory(prev => {
      const next = [...prev, ...newWords].slice(-200);
      try { localStorage.setItem("pb_words", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    // Update category history
    const catCounts = {};
    (gs.categories || []).forEach(c => { catCounts[c.id] = (catCounts[c.id] || 0) + 1; });
    setCatHistory(prev => {
      const next = { ...prev };
      Object.entries(catCounts).forEach(([id, n]) => { next[id] = (next[id] || 0) + n; });
      try { localStorage.setItem("pb_cats", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    setStats(prev => {
      const newStreak = won ? (prev.streak || 0) + 1 : 0;
      const updated = {
        played: (prev.played || 0) + 1,
        won: (prev.won || 0) + (won ? 1 : 0),
        best: Math.max(prev.best || 0, myScore),
        total: (prev.total || 0) + myScore,
        streak: newStreak,
        totalWords: (prev.totalWords || 0) + wordsThisGame,
        uniqueWords: (prev.uniqueWords || 0) + new Set(newWords).size,
      };
      try { localStorage.setItem("pb_stats", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    const xpGain = calcXpGain(myScore, won, gs.totalRounds || 1);
    const newXp = (xp || 0) + xpGain;
    setXp(() => {
      try { localStorage.setItem("pb_xp", String(newXp)); } catch { /* ignore */ }
      return newXp;
    });

    // Vérifier les badges APRÈS la mise à jour de stats (pas d'imbrication setStats → évite stale closure)
    // On utilise les stats finales déjà calculées plutôt que les passer via setStats imbriqué
    // Réutiliser `won` calculé plus haut pour éviter toute divergence entre les deux endroits
    const finalStats = {
      played: (stats.played || 0) + 1,
      won: (stats.won || 0) + (won ? 1 : 0),
      best: Math.max(stats.best || 0, myScore),
      total: (stats.total || 0) + myScore,
      streak: won ? (stats.streak || 0) + 1 : 0,
      totalWords: (stats.totalWords || 0) + newWords.length,
      uniqueWords: (stats.uniqueWords || 0) + new Set(newWords).size,
    };
    setUnlockedBadges(prev => {
      const newlyUnlockedDefs = BADGE_DEFS.filter(b =>
        !prev.includes(b.id) && b.check(finalStats)
      );
      if (newlyUnlockedDefs.length > 0) {
        const newlyUnlocked = newlyUnlockedDefs.map(b => b.id);
        const updated = [...new Set([...prev, ...newlyUnlocked])];
        try { localStorage.setItem("pb_badges", JSON.stringify(updated)); } catch { /* ignore */ }
        setNewBadges(newlyUnlockedDefs);
        setTimeout(() => setNewBadges([]), 4000);
        return updated;
      }
      return prev;
    });

    // Mark daily as played
    if (gs.isDaily) {
      const { todayKey } = getDailyChallenge();
      const entry = { todayKey, score: myScore };
      setDailyPlayed(entry);
      try { localStorage.setItem("pb_daily", JSON.stringify(entry)); } catch { /* ignore */ }
    }

    // Sauvegarder score tournoi dans Firebase
    if (gs.isTournoi && uid && FB.db) {
      try {
        const weekKey = "week_" + gs.weekNum;
        dbSet(dbRef(FB.db, `tournoi/${weekKey}/${uid}`), {
          name: settings.playerName || "Joueur",
          score: myScore,
          xp: newXp,
          updatedAt: Date.now(),
        });
      } catch { /* ignore */ }
    }

    logEvent("game_end", { uid, mode: gs.mode, score: myScore, won });

    // ROOM CLEANUP FIX: marquer la room comme terminée pour éviter qu'elle
    // apparaisse dans le matchmaking et pollue findPublicRoom.
    if (gs.roomCode && FB.db) {
      try {
        FB.updateRoom(gs.roomCode, { status: "finished", finishedAt: Date.now() }).catch(() => {});
      } catch { /* ignore */ }
    }
  }

  return (
    <ErrorBoundary>
      <div className="app">
        {screen === "home"    && <HomeScreen
          onSolo={() => goSetup("solo")}
          onOnline={() => goOnline("solo")}
          on2v2={() => goSetup("2v2")}
          onMort={() => goSetup("mort")}
          onOnline2v2={() => goOnline("2v2")}
          onOnlineMort={() => goOnline("mort")}
          onDaily={startDailyChallenge}
          onTournoi={() => startTournamentGame()}
          stats={stats} tier={tier} xp={xp}
          onTier={() => setShowTier(true)}
          onProfile={() => setShowProfile(true)}
          onSettings={() => setShowSettings(true)}
          playerName={settings.playerName}
          dailyPlayed={dailyPlayed}
          profilePhoto={profilePhoto}
          onShare={() => setShowShare(true)}
          lang={lang}
          daily={daily}
          tournament={tournament}
          levelInfo={levelInfo}
        />}
        {screen === "setup"   && <SetupScreen mode={gameState?.mode} settings={settings} setSettings={setSettings} onStart={startSoloGame} onBack={() => setScreen("home")} tier={tier} onTier={() => setShowTier(true)} lang={lang} />}
        {screen === "online"  && <OnlineScreen uid={uid} settings={settings} setSettings={setSettings} onEnterGame={enterOnlineGame} onBack={() => setScreen("home")} tier={tier} lang={lang} gameMode={gameState?.mode} />}
        {screen === "game"    && gameState && <GameScreen gameState={gameState} setGameState={setGameState} uid={uid} lang={lang} onEndGame={handleGameEnd} />}
        {screen === "results" && gameState && <FinalResultsScreen gameState={gameState} onPlayAgain={() => {
            const m = gameState?.mode;
            if (m === "tournoi") startTournamentGame();
            else if (m === "daily") startDailyChallenge();
            else if (gameState?.roomCode) setScreen("online");
            else setScreen("setup");
          }} onHome={() => setScreen("home")} uid={uid} lang={lang} />}
        {screen !== "game" && <BottomNav tab={tab} setTab={setTab} setScreen={setScreen} setGameState={setGameState} onLeaderboard={() => setShowLeaderboard(true)} lang={lang} />}
      </div>
      {showTier && <TierModal current={tier} uid={uid} onSelect={t => { setTier(t); setShowTier(false); }} onClose={() => setShowTier(false)} lang={lang} />}
      {showProfile && <ProfilePanel stats={stats} xp={xp} playerName={settings.playerName} wordHistory={wordHistory} catHistory={catHistory} tier={tier} unlockedBadges={unlockedBadges} onClose={() => setShowProfile(false)} onLeaderboard={() => { setShowProfile(false); setShowLeaderboard(true); }} onThemes={() => { setShowProfile(false); setShowThemes(true); }} onEditProfile={() => { setShowProfile(false); setShowProfilePhoto(true); }}
          onShare={() => { setShowProfile(false); setShowShare(true); }}
          onRateApp={() => { setShowProfile(false); setShowRateApp(true); }}
          onBugReport={() => { setShowProfile(false); setShowBugReport(true); }}
          onFriends={() => { setShowProfile(false); setShowFriends(true); }}
          friendRequestCount={Object.keys(friendRequests).length}
          lang={lang} />}
      {showFriends && <FriendsPanel
          uid={uid}
          myFriendCode={myFriendCode}
          playerName={settings.playerName}
          friends={friends}
          friendRequests={friendRequests}
          onClose={() => setShowFriends(false)}
          onRefresh={() => {}}
          lang={lang}
        />}
      {showOnboarding && <OnboardingScreen onDone={(name) => {
          const finalName = name || t("ob5_placeholder","Joueur");
          setSettings(s => ({ ...s, playerName: finalName }));
          // BUG 10 FIX: persist name to localStorage
          try { localStorage.setItem("pb_name", finalName); } catch { /* ignore */ }
          setShowOnboarding(false);
        }} lang={lang} />}
      {showLeaderboard && <LeaderboardScreen onClose={() => setShowLeaderboard(false)} playerName={settings.playerName} xp={xp} uid={uid} tier={tier} lang={lang} />}
      {showThemes && <ThemesScreen current={theme} onSelect={t => { setTheme(t); applyTheme(t); setShowThemes(false); }} onClose={() => setShowThemes(false)} tier={tier} onTier={() => { setShowThemes(false); setShowTier(true); }} lang={lang} />}
      {newBadges.length > 0 && <BadgeNotification badges={newBadges} lang={lang} />}
      {showSettings && <SettingsPanel
        settings={settings} setSettings={setSettings}
        theme={theme} onThemeChange={th => { setTheme(th); applyTheme(th); }}
        lang={lang} setLang={setLang}
        tier={tier} onTier={() => { setShowSettings(false); setShowTier(true); }}
        onClose={() => setShowSettings(false)}
          onShowLegal={(type) => { setShowSettings(false); setShowLegal(type); }}
        onBugReport={() => { setShowSettings(false); setShowBugReport(true); }}
        onRateApp={() => { setShowSettings(false); setShowRateApp(true); }}
        onShare={() => { setShowSettings(false); setShowShare(true); }}
        onEditProfile={() => { setShowSettings(false); setShowProfilePhoto(true); }}
      />}
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} lang={lang} />}
      {showRateApp && <RateAppModal onClose={() => setShowRateApp(false)} lang={lang} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} lang={lang} />}
      {showLegal && <LegalModal onClose={() => setShowLegal(null)} lang={lang} type={showLegal} />}
      {showProfilePhoto && <ProfilePhotoModal
        onClose={() => setShowProfilePhoto(false)}
        onSave={p => { setProfilePhoto(p); try { localStorage.setItem("pb_photo", JSON.stringify(p)); } catch { /* ignore */ } }}
        currentPhoto={profilePhoto?.emoji || ""}
        playerName={settings.playerName}
        lang={lang}
      />}
    </ErrorBoundary>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────
function HomeScreen({ onSolo, onOnline, on2v2, onMort, onOnline2v2, onDaily, onTournoi, stats, tier, onTier, onProfile, onSettings, playerName, xp, dailyPlayed, profilePhoto, lang, daily, tournament, levelInfo }) {
  const t = useT(lang || "fr");
  const bc = tier === TIER.VIP ? "bvipbadge" : tier === TIER.PRO ? "bprobadge" : "bfree";
  const bl = tier === TIER.VIP ? t("vip_label") : tier === TIER.PRO ? t("pro_label") : "◇";
  const initials = (playerName || "J").charAt(0).toUpperCase();
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timerId = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(timerId);
  }, []);
  const alreadyPlayed = dailyPlayed?.todayKey === daily.todayKey;
  // Recalculer les compteurs de temps à chaque tick (daily/tournament sont figés par useMemo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const liveDaily = useMemo(() => getDailyChallenge(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const liveTournament = useMemo(() => getTournamentWeek(), [tick]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div className="hdr">
        <div className="logo">{"Petit"}<span>{t("app_logo2","Bac")}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className={`badge ${bc}`} onClick={onTier} style={{ fontFamily: "inherit" }}>{bl}</button>
          <button onClick={onSettings} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--br)", background: "var(--sf)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</button>
          <button className="avatar-btn" onClick={onProfile} style={{
            background: profilePhoto?.type === "emoji" ? profilePhoto.bg :
                       profilePhoto?.type === "photo" ? "transparent" : "linear-gradient(135deg,var(--ac),var(--acl))",
            overflow: profilePhoto?.type === "photo" ? "hidden" : undefined,
            padding: 0,
          }}>
            {profilePhoto?.type === "photo" ?
              <img src={profilePhoto.data} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="avatar"/> :
              profilePhoto?.type === "emoji" ? profilePhoto.emoji : initials}
          </button>
        </div>
      </div>

      <div className="cnt">
        {/* Greeting + Level + XP */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.5px" }}>
                {t("greeting")}, {playerName || t("ob5_placeholder","Joueur")} 👋
              </div>
              <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 2 }}>
                {stats.played > 0 ? `${stats.played} partie${stats.played > 1 ? "s" : ""} · ${stats.won} victoire${stats.won > 1 ? "s" : ""}` : t("ready","Prêt à jouer ?")}
              </div>
            </div>
            <button className="level-chip" onClick={onProfile}>
              {levelInfo.badge} {t("level","Niv.")} {levelInfo.level}
            </button>
          </div>
          {/* XP Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--txm)", marginBottom: 4 }}>
              <span>{levelInfo.name}</span>
              <span>{xp} / {levelInfo.next?.xpNeeded || "MAX"} XP</span>
            </div>
            <div className="xp-bar"><div className="xp-fill" style={{ width: `${levelInfo.progress}%` }} /></div>
          </div>
        </div>

        {/* Quick stats */}
        {stats.played > 0 && (
          <div className="sgrid" style={{ marginBottom: 18 }}>
            {[
              [t("stats_games"), stats.played],
              [t("stats_wins"), stats.won],
              [t("stats_best"), stats.best + " " + t("pts","pts")],
              [t("stats_total"), stats.total + " " + t("pts","pts")]
            ].map(([l, v]) => (
              <div key={l} className="scard"><div className="snum">{v}</div><div className="slbl">{l}</div></div>
            ))}
          </div>
        )}

        {/* Daily Challenge Card */}
        <button
          className={`daily-card ${alreadyPlayed ? "daily-card-done" : "daily-card-bg"}`}
          onClick={alreadyPlayed ? undefined : (canPro ? onDaily : onTier)}
        >
          <div className="daily-star">⭐</div>
          {!alreadyPlayed && <div className="daily-letter-badge">{daily.letter}</div>}
          <div className={alreadyPlayed ? "" : ""} style={{ color: alreadyPlayed ? "var(--tx)" : "#fff" }}>
            <div className="daily-label" style={{ color: alreadyPlayed ? "var(--txm)" : undefined }}>
              {alreadyPlayed ? t("daily_done") : "⭐ " + t("daily_label")}
            </div>
            <div className="daily-title" style={{ color: alreadyPlayed ? "var(--tx)" : undefined }}>
              {alreadyPlayed ? t("daily_back") : t("daily_letter_desc",`${t("letter_label","Lettre :")} ${daily.letter} · 1 round · ${t("hard","Difficile")}`).replace("{0}", daily.letter)}
            </div>
            {alreadyPlayed && dailyPlayed?.score !== undefined
              ? <div className="daily-score">{dailyPlayed?.score} pts</div>
              : !alreadyPlayed && <div className="daily-sub">{t("daily_exclusive")}</div>
            }
            <div className="daily-cats">
              {daily.cats.map(c => (
                <span key={c.id} className={alreadyPlayed ? "daily-cat-chip-done" : "daily-cat-chip"}>
                  {c.emoji} {getCatLabel(c.id, lang || "fr")}
                </span>
              ))}
            </div>
            {!alreadyPlayed && (
              <div style={{ marginTop:6, fontSize:11, fontFamily:"monospace", opacity:.85, display:"flex", alignItems:"center", gap:4 }}>
                ⏱ {String(liveDaily.hoursLeft).padStart(2,"0")}:{String(liveDaily.minsLeft).padStart(2,"0")}:{String(liveDaily.secsLeft).padStart(2,"0")}
              </div>
            )}
            {!canPro && !alreadyPlayed && (
              <div style={{ marginTop: 8, fontSize: 11, opacity: .8 }}>{t("pro_required")}</div>
            )}
          </div>
        </button>

        {/* Weekly Tournament Card */}
        <button className="tournament-card" onClick={canPro ? onTournoi : onTier}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize: 10, opacity: .8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{t("tournament_label2")}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{t("tournament_title2")}</div>
              <div style={{ fontSize: 11, opacity: .85, marginBottom:6 }}>
                {liveTournament.daysLeft > 0 ? `${liveTournament.daysLeft} ${t("tournament_days","jours restants")}` : `${String(liveTournament.hoursLeft).padStart(2,"0")}h${String(liveTournament.minsLeft).padStart(2,"0")}m`}
              </div>
              <div style={{ fontSize:11, background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 8px", marginBottom:4 }}>
                🏆 {t("tournament_prize","Gagnant = 1 mois VIP offert !")}
              </div>
              <div style={{ fontSize:10, opacity:.75 }}>
                ⚡ {t("tournament_rules_short","Réponses uniques = +10pts • Faux = ❌ éliminé")}
              </div>
            </div>
            <div className="tournament-letter">{tournament.letter}</div>
          </div>
          {!canPro && <div style={{ marginTop:8, fontSize:11, opacity:.8 }}>🔒 {t("pro_required")}</div>}
        </button>

        {/* Game modes */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txm)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>{t("game_modes2")}</div>
        <div className="mode-grid">

          {/* Solo vs IA */}
          <button className="game-mode-card gmc-solo" onClick={onSolo}>
            <div className="gmc-icon">🤖</div>
            <div>
              <div className="gmc-title">{t("solo_vs_ia")}</div>
              <div className="gmc-desc">{t("solo_desc2")}</div>
            </div>
          </button>

          {/* En ligne */}
          <button className="game-mode-card gmc-online" onClick={onOnline}>
            <div className="gmc-icon">🌐</div>
            <div>
              <div className="gmc-title">{t("multiplayer")}</div>
              <div className="gmc-desc">{t("online_desc2")}</div>
            </div>
          </button>

          {/* 2v2 */}
          <div className="game-mode-card gmc-2v2" style={{ cursor:"default" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div className="gmc-icon">🤝</div>
              <div style={{ flex:1 }}>
                <div className="gmc-title">{t("mode_2v2")}</div>
                <div className="gmc-desc">{t("mode_2v2_desc2")}</div>
              </div>
            </div>
            {canPro ? (
              <div style={{ display:"flex", gap:6 }}>
                <button className="btn bs" style={{ flex:1, fontSize:11, padding:"7px 4px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff" }} onClick={on2v2}>
                  🤖 {t("vs_bots","vs Bots")}
                </button>
                <button className="btn bp" style={{ flex:1, fontSize:11, padding:"7px 4px", background:"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.5)", color:"#fff" }} onClick={onOnline2v2}>
                  🌍 {t("en_ligne","En ligne")}
                </button>
              </div>
            ) : (
              <button className="btn bs" style={{ width:"100%", fontSize:11, padding:"6px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff" }} onClick={onTier}>
                🔒 {t("unlock_pro","Débloquer PRO")}
              </button>
            )}
          </div>

          {/* Mort subite */}
          <button className="game-mode-card gmc-mort" onClick={canPro ? onMort : onTier}>
            <div className="gmc-icon">💀</div>
            <div>
              <div className="gmc-title">{t("mort_subite")}</div>
              <div className="gmc-desc">{t("mort_desc2")}</div>
            </div>
            {!canPro && <span className="gmc-badge">{t("pro_label")}</span>}
          </button>

        </div>

        {/* Points reminder */}
        <div style={{ padding: "12px 14px", background: "var(--sf)", border: "1.5px solid var(--br)", borderRadius: "var(--rm)", marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txm)", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".5px" }}>{t("points_rule2")}</div>
          <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.7 }}>
            <span style={{ color: "var(--gn)", fontWeight: 700 }}>2 pts</span> {t("pts_unique")} ·{" "}
            <span style={{ color: "var(--yw)", fontWeight: 700 }}>1 pt</span> {t("pts_shared")} ·{" "}
            <span style={{ color: "var(--rd)", fontWeight: 700 }}>0</span> {t("pts_invalid2")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PANEL ────────────────────────────────────────────────
// ─── FRIENDS PANEL ────────────────────────────────────────────────
function FriendsPanel({ uid, myFriendCode, playerName, friends, friendRequests, onClose, onRefresh, lang }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("friends"); // friends | add | requests
  const [addCode, setAddCode] = useState("");
  const [addStatus, setAddStatus] = useState(null); // null | sending | sent | error | self | already
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const requestCount = Object.keys(friendRequests || {}).length;
  const friendList = Object.entries(friends || {}).map(([fuid, data]) => ({ uid: fuid, ...data }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Generate QR code asynchronously using the qrcode package
  useEffect(() => {
    if (!myFriendCode) return;
    import("qrcode").then(mod => {
      const QRCode = mod.default || mod;
      QRCode.toDataURL(myFriendCode, {
        width: 200, margin: 2,
        color: { dark: "#18171a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }).then(url => setQrDataUrl(url)).catch(() => {});
    }).catch(() => {});
  }, [myFriendCode]);

  // Cleanup camera on unmount
  useEffect(() => () => stopScanner(), []);

  function stopScanner() {
    if (streamRef.current) { streamRef.current.getTracks().forEach(tr => tr.stop()); streamRef.current = null; }
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    setScanning(false);
  }

  async function startScanner() {
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      alert(t("qr_not_supported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue.trim().toUpperCase();
              setAddCode(raw);
              setAddStatus(null);
              stopScanner();
            }
          } catch { /* ignore */ }
        }, 500);
      }, 400);
    } catch {
      alert(t("camera_denied"));
    }
  }

  async function handleAddFriend() {
    const code = addCode.trim().toUpperCase();
    if (!code) return;
    if (code === myFriendCode) { setAddStatus("self"); return; }
    setAddStatus("sending");
    try {
      const targetUid = await FB.lookupByFriendCode(code);
      if (!targetUid) { setAddStatus("error"); return; }
      if (targetUid === uid) { setAddStatus("self"); return; }
      // Check not already friends
      if (friends && friends[targetUid]) { setAddStatus("already"); return; }
      await FB.sendFriendRequest(uid, playerName || "Joueur", targetUid);
      setAddStatus("sent");
      setAddCode("");
    } catch {
      setAddStatus("error");
    }
  }

  async function handleAccept(fromUid) {
    await FB.acceptFriendRequest(uid, fromUid);
    onRefresh();
  }
  async function handleReject(fromUid) {
    await FB.rejectFriendRequest(uid, fromUid);
    onRefresh();
  }
  async function handleRemove(friendUid) {
    await FB.removeFriend(uid, friendUid);
    onRefresh();
  }

  function handleCopy() {
    navigator.clipboard?.writeText(myFriendCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for non-secure contexts
      try {
        const ta = document.createElement("textarea");
        ta.value = myFriendCode;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    });
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-hero" style={{ padding: "28px 22px 24px" }}>
          <div style={{ flex: 1 }}>
            <div className="profile-name">👥 {t("friends_title")}</div>
            <div className="profile-sub">{friendList.length} {t("friends_count")}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.18)", border: "none", borderRadius: 12,
            color: "#fff", padding: "8px 14px", cursor: "pointer", fontWeight: 900, fontSize: 16
          }}>✕</button>
        </div>

        <div className="profile-body">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { id: "friends", label: `👥 ${t("friends_tab")}` },
              { id: "add", label: `➕ ${t("add_tab")}` },
              { id: "requests", label: null },
            ].map(tb => (
              <button key={tb.id}
                className={`btn ${tab === tb.id ? "bp" : "bs"}`}
                style={{ flex: 1, fontSize: 12, padding: "10px 6px", position: "relative" }}
                onClick={() => setTab(tb.id)}>
                {tb.id === "requests" ? (
                  <>
                    🔔 {t("requests_tab")}
                    {requestCount > 0 && (
                      <span style={{
                        position: "absolute", top: -7, right: -5,
                        background: "#e74c3c", color: "#fff", borderRadius: "50%",
                        width: 20, height: 20, fontSize: 10, fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(231,76,60,.4)",
                      }}>{requestCount}</span>
                    )}
                  </>
                ) : tb.label}
              </button>
            ))}
          </div>

          {/* ── FRIENDS LIST ── */}
          {tab === "friends" && (
            friendList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--txm)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>👥</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: "var(--tx)" }}>{t("no_friends")}</div>
                <div style={{ fontSize: 13 }}>{t("no_friends_hint")}</div>
                <button className="btn bp" style={{ marginTop: 20 }} onClick={() => setTab("add")}>
                  ➕ {t("add_friend_btn")}
                </button>
              </div>
            ) : (
              <>
                {friendList.map(f => (
                  <div key={f.uid} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: "var(--sf2)",
                    borderRadius: 16, border: "1.5px solid var(--br)", marginBottom: 10,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "var(--acs)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 900, color: "var(--ac)",
                    }}>{(f.name || "?").charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || "Joueur"}</div>
                      <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{f.xp || 0} XP</div>
                    </div>
                    <button
                      onClick={() => handleRemove(f.uid)}
                      style={{
                        background: "none", border: "1.5px solid var(--br)",
                        borderRadius: 10, padding: "6px 10px",
                        cursor: "pointer", color: "var(--txm)", fontSize: 12, flexShrink: 0,
                      }}
                      title={t("remove_friend")}
                    >✕</button>
                  </div>
                ))}
              </>
            )
          )}

          {/* ── ADD FRIEND ── */}
          {tab === "add" && (
            <>
              {/* My code + QR */}
              <div className="profile-section">
                <div className="profile-section-title">{t("my_code")}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  {/* QR Code */}
                  <div style={{
                    background: "#fff", borderRadius: 20, padding: 14,
                    boxShadow: "0 6px 24px rgba(0,0,0,.12)",
                  }}>
                    {qrDataUrl
                      ? <img src={qrDataUrl} alt="QR Code" style={{ width: 160, height: 160, display: "block", borderRadius: 8 }} />
                      : <div style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>⏳</div>
                    }
                  </div>
                  {/* Text code + copy */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--sf2)", border: "1.5px solid var(--br)",
                    borderRadius: 16, padding: "12px 16px", width: "100%",
                  }}>
                    <span style={{
                      flex: 1, fontFamily: "JetBrains Mono, monospace", fontWeight: 900,
                      fontSize: 18, letterSpacing: 3, color: "var(--ac)", textAlign: "center",
                    }}>{myFriendCode || "…"}</span>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: copied ? "var(--ac)" : "var(--acs)",
                        border: "none", borderRadius: 10,
                        padding: "8px 12px", cursor: "pointer",
                        color: copied ? "#fff" : "var(--ac)",
                        fontWeight: 800, fontSize: 12, flexShrink: 0,
                        transition: "all .2s",
                      }}
                    >{copied ? `✓ ${t("copied")}` : `📋 ${t("copy")}`}</button>
                  </div>
                </div>
              </div>

              {/* Add by code input */}
              <div className="profile-section">
                <div className="profile-section-title">{t("add_by_code")}</div>
                {/* QR scanner viewport */}
                {scanning && (
                  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 12, aspectRatio: "1 / 1" }}>
                    <video ref={videoRef} autoPlay playsInline muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {/* Overlay reticle */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{
                        width: "58%", height: "58%",
                        border: "2.5px solid rgba(255,255,255,.9)",
                        borderRadius: 12,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,.45)",
                      }} />
                    </div>
                    <button onClick={stopScanner} style={{
                      position: "absolute", top: 10, right: 10,
                      background: "rgba(0,0,0,.6)", border: "none",
                      borderRadius: 10, color: "#fff", padding: "6px 10px",
                      cursor: "pointer", fontWeight: 700,
                    }}>✕</button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    value={addCode}
                    onChange={e => { setAddCode(e.target.value.toUpperCase()); setAddStatus(null); }}
                    onKeyDown={e => { if (e.key === "Enter") handleAddFriend(); }}
                    placeholder={t("enter_code")}
                    maxLength={12}
                    style={{
                      flex: 1, background: "var(--sf2)", border: "1.5px solid var(--br)",
                      borderRadius: 12, padding: "12px 14px", color: "var(--tx)",
                      fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                      fontSize: 14, outline: "none",
                    }}
                  />
                  {!scanning && (
                    <button
                      onClick={startScanner}
                      title={t("scan_qr")}
                      style={{
                        background: "var(--sf2)", border: "1.5px solid var(--br)",
                        borderRadius: 12, padding: "0 14px",
                        cursor: "pointer", fontSize: 22, flexShrink: 0,
                      }}>📷</button>
                  )}
                </div>
                {/* Status messages */}
                {addStatus === "self"    && <div className="friend-status-err">{t("add_self_error")}</div>}
                {addStatus === "already" && <div className="friend-status-err">{t("add_already_error")}</div>}
                {addStatus === "error"   && <div className="friend-status-err">{t("add_not_found")}</div>}
                {addStatus === "sent"    && <div className="friend-status-ok">✅ {t("add_sent")}</div>}
                <button
                  className="btn bp"
                  onClick={handleAddFriend}
                  disabled={addStatus === "sending" || !addCode.trim()}
                  style={{ marginTop: 4 }}>
                  {addStatus === "sending" ? "⏳" : `➕ ${t("add_friend_btn")}`}
                </button>
              </div>
            </>
          )}

          {/* ── FRIEND REQUESTS ── */}
          {tab === "requests" && (
            Object.entries(friendRequests || {}).length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--txm)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔔</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--tx)" }}>{t("no_requests")}</div>
              </div>
            ) : Object.entries(friendRequests).map(([fromUid, req]) => (
              <div key={fromUid} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: "var(--sf2)",
                borderRadius: 16, border: "1.5px solid var(--br)", marginBottom: 10,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "var(--acs)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, color: "var(--ac)",
                }}>{(req.name || "?").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.name || "Joueur"}</div>
                  <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{t("wants_to_add")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleAccept(fromUid)}
                    style={{
                      background: "#00b894", border: "none", borderRadius: 10,
                      padding: "8px 12px", cursor: "pointer",
                      color: "#fff", fontWeight: 900, fontSize: 15,
                    }}>✓</button>
                  <button
                    onClick={() => handleReject(fromUid)}
                    style={{
                      background: "none", border: "1.5px solid var(--br)",
                      borderRadius: 10, padding: "8px 12px",
                      cursor: "pointer", color: "var(--txm)", fontSize: 14,
                    }}>✕</button>
                </div>
              </div>
            ))
          )}

          <button className="btn bs" style={{ marginTop: 4 }} onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ stats, playerName, wordHistory, catHistory, tier, onClose, xp, unlockedBadges, onLeaderboard, onThemes, onEditProfile, onShare, onRateApp, onBugReport, onFriends, friendRequestCount, lang }) {
  const t = useT(lang || "fr");
  const initials = (playerName || "J").charAt(0).toUpperCase();
  const tierLabel = tier === TIER.VIP ? "VIP ★" : tier === TIER.PRO ? "PRO ◆" : t("free_label","◇");
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const levelInfo = getLevelInfo(xp || 0, lang);

  // Top 5 most used words
  const wordCount = {};
  wordHistory.forEach(w => { if (w) wordCount[w] = (wordCount[w] || 0) + 1; });
  const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

  // Top categories
  const topCats = Object.entries(catHistory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = topCats[0]?.[1] || 1;
  const catMap = {};
  [...FREE_CATS, ...PRO_CATS].forEach(c => { catMap[c.id] = c; });

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{playerName || t("ob5_placeholder","Joueur")}</div>
            <div className="profile-sub">{tierLabel} · {levelInfo.badge} {levelInfo.name}</div>
            {/* XP Progress bar */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: .75, marginBottom: 4 }}>
                <span>{xp} XP</span>
                {levelInfo.next && <span>→ {levelInfo.next.name} ({levelInfo.next.xpNeeded} XP)</span>}
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${levelInfo.progress}%`, background: "#fff", borderRadius: 4, transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {/* Stats */}
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-num">{stats.played}</div>
              <div className="pstat-lbl">{t("stats_games")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.won}</div>
              <div className="pstat-lbl">{t("stats_wins")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{winRate}%</div>
              <div className="pstat-lbl">{t("stats_winrate")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.best}</div>
              <div className="pstat-lbl">{t("stats_best")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.total}</div>
              <div className="pstat-lbl">{t("stats_total")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.played > 0 ? Math.round(stats.total / stats.played) : 0}</div>
              <div className="pstat-lbl">{t("stats_avg")}</div>
            </div>
          </div>

          {/* Top words */}
          {topWords.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">{t("fav_words")}</div>
              <div className="word-chips">
                {topWords.map(w => <span key={w} className="word-chip">{w}</span>)}
              </div>
            </div>
          )}
          {topWords.length === 0 && (
            <div className="profile-section">
              <div className="profile-section-title">{t("fav_words")}</div>
              <div style={{ fontSize: 13, color: "var(--txm)", fontStyle: "italic" }}>
                {t("no_words_yet2")}
              </div>
            </div>
          )}

          {/* Favorite categories */}
          <div className="profile-section">
            <div className="profile-section-title">{t("fav_cats2")}</div>
            {topCats.length > 0 ? topCats.map(([catId, count]) => {
              const cat = catMap[catId];
              if (!cat) return null;
              return (
                <div key={catId} className="cat-rank">
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{getCatLabel(cat.id, lang || "fr")}</span>
                  <div className="cat-rank-bar">
                    <div className="cat-rank-fill" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--txm)", fontFamily: "JetBrains Mono, monospace", minWidth: 24, textAlign: "right" }}>{count}</span>
                </div>
              );
            }) : (
              <div style={{ fontSize: 13, color: "var(--txm)", fontStyle: "italic" }}>
                {t("no_cats_yet")}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="profile-section">
            <div className="profile-section-title">{t("badges_section","Badges")} ({unlockedBadges?.length || 0}/{BADGE_DEFS.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BADGE_DEFS.map(b => {
                const unlocked = unlockedBadges?.includes(b.id);
                return (
                  <div key={b.id} title={b.desc} style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, background: unlocked ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${unlocked ? "var(--ac-border,rgba(67,56,202,0.2))" : "var(--br)"}`,
                    opacity: unlocked ? 1 : 0.3, cursor: "default",
                  }}>
                    {b.icon}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, marginTop: 4 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onLeaderboard}>🏆 {t("nav_rank")}</button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onThemes}>{t("themes_title")}</button>
          </div>
          {/* Friends */}
          <button className="btn bs mb8" style={{ marginBottom: 8, position: "relative" }} onClick={onFriends}>
            {t("friends_btn")}
            {friendRequestCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -4,
                background: "#e74c3c", color: "#fff", borderRadius: "50%",
                width: 20, height: 20, fontSize: 10, fontWeight: 900,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(231,76,60,.4)",
              }}>{friendRequestCount}</span>
            )}
          </button>
          {/* Profile photo */}
          <button className="btn bs mb8" style={{ marginBottom: 8 }} onClick={onEditProfile}>
            {t("edit_photo")}
          </button>

          {/* Community */}
          <div className="ctitle" style={{ marginTop: 16 }}>{t("community")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onShare}>
              {t("share_game")}
            </button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onRateApp}>
              {t("rate_app")}
            </button>
          </div>
          <button className="btn bs mb8" style={{ marginBottom: 16 }} onClick={onBugReport}>
            {t("bug_title")}
          </button>

          {/* Legal */}
          <div className="ctitle">{t("legal")}</div>
          <div className="card" style={{ padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{t("legal_title")}</div>
              <div>{t("legal_version")}</div>
              <div>{t("all_rights")}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_licenses")}</span>
              </div>
              <div>{t("legal_react")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("personal_data")}</span>
              </div>
              <div>{t("data_policy")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_contact")}</span> {t("legal_contact_email")}
              </div>
            </div>
          </div>

          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ONLINE SCREEN ────────────────────────────────────────────────
function OnlineScreen({
  uid, settings, setSettings, onEnterGame, onBack, lang, gameMode
}) {
  const t = useT(lang || "fr");
  const [step, setStep] = useState("choose");   // choose | configure | matchmaking | private_create | private_join | waiting
  const [playerName, setPlayerName] = useState(settings.playerName);
  const [country, setCountry] = useState(settings.country || "France");
  const [roomCode, setRoomCode] = useState(null);
  // Config hôte (peut être modifié dans l'étape "configure")
  const [hostDiff, setHostDiff] = useState(settings.difficulty || "medium");
  const [hostRounds, setHostRounds] = useState(settings.totalRounds || 5);
  const [hostCats, setHostCats] = useState(settings.categories || []);
  // Fallback uid si Firebase auth pas encore prête — stable via state initializer
  const [generatedId] = useState(() => "local_" + Math.random().toString(36).substring(2, 9));
  const myUid = uid || generatedId;
  const [joinCode, setJoinCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [customTeams, setCustomTeams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const unsubRef = useRef(null);

  function cleanup() { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } }

  // RECONNEXION: si une room active a été mémorisée (reload de page en pleine
  // partie), tenter de reprendre automatiquement plutôt que de forcer le joueur
  // à retaper le code de salon.
  useEffect(() => {
    let stored;
    try { stored = localStorage.getItem("pb_active_room"); } catch { stored = null; }
    if (stored) joinPrivate(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retirer le joueur de la room Firebase avant de quitter la salle d'attente
  // pour éviter les joueurs fantômes (ghost players) qui gonflent le compteur
  async function leaveRoom() {
    if (roomCode && myUid && FB.db) {
      try {
        const room = await FB.getRoom(roomCode);
        if (room && room.status === "waiting") {
          const updatedPlayers = { ...(room.players || {}) };
          delete updatedPlayers[myUid];
          const updatedScores = { ...(room.cumulativeScores || {}) };
          delete updatedScores[myUid];
          // Si plus aucun joueur (hôte parti seul), supprimer la room entièrement
          if (Object.keys(updatedPlayers).length === 0) {
            await FB.updateRoom(roomCode, { status: "finished", finishedAt: Date.now() });
          } else {
            // Multi-path update: supprimer notre entrée + transférer l'hôte si nécessaire
            const wasHost = room.hostId === myUid;
            const nextHostId = wasHost ? Object.keys(updatedPlayers)[0] : null;
            const updates = {
              [`players/${myUid}`]: null,
              [`cumulativeScores/${myUid}`]: null,
            };
            if (wasHost && nextHostId) {
              updates[`players/${nextHostId}/isHost`] = true;
              updates.hostId = nextHostId;
            }
            await FB.updateRoom(roomCode, updates);
          }
        }
      } catch { /* ignore — ne pas bloquer la navigation */ }
    }
    try { localStorage.removeItem("pb_active_room"); } catch { /* ignore */ }
  }

  useEffect(() => cleanup, []);

  async function doMatchmaking(retries = 0, resolvedUid = null) {
    if (retries > 3) { setError(t("room_not_found","Impossible de trouver une salle. Réessaie.")); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const realUid = resolvedUid || (await FB.signIn()).uid;
      const existingCode = await FB.findPublicRoom(country);
      if (existingCode) {
        // Join existing room — re-fetch to confirm it is still waiting (could have started)
        const room = await FB.getRoom(existingCode);
        if (!room || room.status !== "waiting") {
          // Salle démarrée entre-temps : en créer une nouvelle
          setError("");
          return doMatchmaking(retries + 1, realUid);
        }
        await FB.updateRoom(existingCode, {
          [`players/${realUid}`]: { uid: realUid, name: sanitizeName(playerName), country, isHost: false, ready: false, connected: true },
          [`cumulativeScores/${realUid}`]: 0,
        });
        setRoomCode(existingCode);
        try { localStorage.setItem("pb_active_room", existingCode); } catch { /* ignore */ }
        setStep("waiting");
        unsubRef.current = FB.listenRoom(existingCode, rd => {
          setRoomData(rd);
          if (rd.status === "playing") { cleanup(); onEnterGame(existingCode, rd, realUid); }
        });
      } else {
        // Create public room
        const code = genCode();
        const newRoom = {
          code, type: "public", country,
          hostId: realUid, status: "waiting",
          settings: { difficulty: settings.difficulty, categories: settings.categories, totalRounds: settings.totalRounds, gameMode: gameMode || "solo", mortCatCount: settings.mortCatCount || 3 },
          players: { [realUid]: { uid: realUid, name: sanitizeName(playerName), country, isHost: true, ready: true, connected: true } },
          currentRound: 0, spinnerIndex: 0, phase: "waiting",
          cumulativeScores: { [realUid]: 0 },
        };
        await FB.createRoom(code, newRoom);
        setRoomCode(code);
        try { localStorage.setItem("pb_active_room", code); } catch { /* ignore */ }
        setStep("waiting");
        unsubRef.current = FB.listenRoom(code, rd => {
          setRoomData(rd);
          if (rd.status === "playing") { cleanup(); onEnterGame(code, rd, realUid); }
        });
      }
    } catch (e) { cleanup(); setError(e.message); }
    setLoading(false);
  }

  async function createPrivate() {
    setLoading(true); setError("");
    try {
      const realUid = (await FB.signIn()).uid;
      const code = genCode();
      const finalCats = hostCats.length > 0 ? hostCats : settings.categories;
      const newRoom = {
        code, type: "private", country,
        hostId: realUid, status: "waiting",
        settings: { difficulty: hostDiff, categories: finalCats, totalRounds: hostRounds, gameMode: gameMode || "solo", mortCatCount: settings.mortCatCount || 3 },
        players: { [realUid]: { uid: realUid, name: sanitizeName(playerName), country, isHost: true, ready: true, connected: true } },
        currentRound: 0, spinnerIndex: 0, phase: "waiting",
        cumulativeScores: { [realUid]: 0 },
      };
      await FB.createRoom(code, newRoom);
      setRoomCode(code);
      try { localStorage.setItem("pb_active_room", code); } catch { /* ignore */ }
      setStep("waiting");
      unsubRef.current = FB.listenRoom(code, rd => {
        setRoomData(rd);
        if (rd.status === "playing") { cleanup(); onEnterGame(code, rd, realUid); }
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function joinPrivate(explicitCode) {
    // Garde défensive: si jamais appelé directement en onClick, React passerait
    // l'event en 1er argument plutôt qu'un code — ignorer tout ce qui n'est pas une string.
    const code = (typeof explicitCode === "string" ? explicitCode : joinCode).trim().toUpperCase();
    if (code.length < 4) return;
    setLoading(true); setError("");
    try {
      const realUid = (await FB.signIn()).uid;
      let room = null;
      let attempts = 0;
      while (attempts < 3) {
        try {
          room = await FB.getRoom(code);
          break;
        } catch (e) {
          if (e.message && e.message.includes("PERMISSION_DENIED")) {
            throw new Error("⚠️ Firebase: configure les règles sur firebase.google.com → Realtime Database → Rules → .read: true", { cause: e });
          }
          if (attempts === 2) throw e;
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
        }
      }
      if (!room) {
        throw new Error(t("room_not_found", "Salon introuvable. Vérifie le code (4 lettres majuscules)."));
      }
      // RECONNEXION: si le joueur était déjà dans cette room (même uid stable, cf.
      // FB.signIn) et que la partie a démarré entre-temps (reload de page, coupure),
      // on le laisse reprendre directement là où en est la partie plutôt que de le
      // bloquer avec "partie déjà en cours".
      const alreadyInRoom = room.players && room.players[realUid];
      if (room.status === "finished") {
        try { localStorage.removeItem("pb_active_room"); } catch { /* ignore */ }
        throw new Error(t("room_not_found", "Salon introuvable. Vérifie le code (4 lettres majuscules)."));
      }
      if (room.status !== "waiting" && !alreadyInRoom) {
        throw new Error(t("game_in_progress", "La partie a déjà commencé."));
      }
      if (room.status === "playing" && alreadyInRoom) {
        setRoomCode(code);
        try { localStorage.setItem("pb_active_room", code); } catch { /* ignore */ }
        unsubRef.current = FB.listenRoom(code, rd => {
          if (!rd) return;
          setRoomData(rd);
          if (rd.status === "playing") { cleanup(); onEnterGame(code, rd, realUid); }
        });
        onEnterGame(code, room, realUid);
        setLoading(false);
        return;
      }
      const myPlayer = { uid: realUid, name: sanitizeName(playerName || settings.playerName), country, isHost: false, ready: true, connected: true };
      await FB.updateRoom(code, {
        [`players/${realUid}`]: myPlayer,
        [`cumulativeScores/${realUid}`]: 0,
      });
      setRoomCode(code);
      try { localStorage.setItem("pb_active_room", code); } catch { /* ignore */ }
      setStep("waiting");
      unsubRef.current = FB.listenRoom(code, rd => {
        if (!rd) return;
        setRoomData(rd);
        if (rd.status === "playing") { cleanup(); onEnterGame(code, rd, realUid); }
      });
    } catch (e) {
      setError(e.message || t("room_not_found", "Impossible de rejoindre. Réessaie."));
    }
    setLoading(false);
  }

  async function startGame() {
    if (!roomCode) return;
    const room = await FB.getRoom(roomCode);
    if (!room) return;
    const playerIds = Object.keys(room.players || {});
    const spinnerOrder = [...playerIds].sort(() => Math.random() - 0.5);

    // Équipes 2v2: si l'hôte a fait des assignations manuelles, les utiliser
    // Sinon mélanger aléatoirement
    let teams2v2 = null;
    if (gameMode === "2v2") {
      if (customTeams && Object.keys(customTeams).length > 0) {
        // Convertir les assignments en groupes d'équipes
        const tg = { team0: [], team1: [], team2: [] };
        Object.entries(customTeams).forEach(([key, pid]) => {
          const teamId = key.split("_")[0];
          if (tg[teamId]) tg[teamId].push(pid);
        });
        // Ne garder que les équipes non-vides
        teams2v2 = Object.fromEntries(Object.entries(tg).filter(([, v]) => v.length > 0));
      } else {
        const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
        const half = Math.ceil(shuffled.length / 2);
        teams2v2 = { team0: shuffled.slice(0, half), team1: shuffled.slice(half) };
      }
    }

    // Pour mort subite: choisir les catégories actives du 1er round
    const mortCatCountOnline = room.settings?.mortCatCount || null;
    const allCatIds = room.settings?.categories || [];
    let firstRoundCatIds = allCatIds;
    if (room.settings?.gameMode === "mort" && mortCatCountOnline) {
      const shuffled = [...allCatIds].sort(() => Math.random() - 0.5);
      firstRoundCatIds = shuffled.slice(0, Math.min(mortCatCountOnline, shuffled.length));
    }

    // phase: "roulette" → déclenche la roulette de lettre
    await FB.updateRoom(roomCode, {
      status: "playing",
      phase: "roulette",
      spinnerOrder,
      spinnerIndex: 0,
      currentRound: 1,
      letter: null,
      startedAt: Date.now(),
      activeCategoryIds: firstRoundCatIds,
      ...(teams2v2 ? { teams: teams2v2 } : {}),
    });
  }

  const players = roomData ? Object.values(roomData.players || {}) : [];
  const isHost = roomData?.hostId === myUid || roomData?.hostId === uid;

  if (step === "choose") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={onBack} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("play_online")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {!FIREBASE_READY && (
          <div className="fb-banner">
            <div className="fb-title">{t("firebase_demo")}</div>
            <div className="fb-desc">{t("firebase_demo_desc")}</div>
          </div>
        )}
        {FIREBASE_READY && (
          <div style={{ padding:"8px 12px", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:"var(--rs)", marginBottom:10, fontSize:11, color:"var(--gn)", display:"flex", alignItems:"center", gap:6 }}>
            <span>🟢</span> {t("firebase_connected","Firebase connecté — multijoueur actif")}
          </div>
        )}
        <div className="card">
          <div className="ctitle">{t("your_profile2")}</div>
          <input className="inp mb8" style={{ marginBottom: 8 }} value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={t("your_firstname")} maxLength={20} />
          <select className="inp" value={country} onChange={e => setCountry(e.target.value)}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="online-modes">
          <div className="mode-card" onClick={() => { setSettings(s => ({ ...s, playerName, country })); doMatchmaking(); setStep("matchmaking"); }}>
            <div className="mode-icon">🌍</div>
            <div className="mode-title">{t("public_game")}</div>
            <div className="mode-desc">{t("matchmaking_country")} {country} {t("matchmaking_random")}</div>
          </div>
          <div className="mode-card" onClick={() => setStep("configure")}>
            <div className="mode-icon">🔒</div>
            <div className="mode-title">{t("private_room")}</div>
            <div className="mode-desc">{t("online_subtitle")}</div>
          </div>
        </div>
        <div className="mode-card" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 14 }} onClick={() => setStep("private_join")}>
          <div style={{ fontSize: 28 }}>🎟️</div>
          <div><div className="mode-title">{t("join_with_code")}</div><div className="mode-desc">{t("code_prompt")}</div></div>
        </div>
      </div>
    </div>
  );

  if (step === "matchmaking") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { leaveRoom(); cleanup(); setStep("choose"); }} style={{ width: "auto" }}>{t("cancel2")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("search_ellipsis")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: "var(--rd)" }}>{error}</div>}
        <div className="mm-box">
          <div className="mm-spinner" />
          <div className="mm-title">{t("searching_players")}</div>
          <div className="mm-sub">{t("waiting_players_desc")}</div>
          <div className="mm-country">📍 {country}</div>
        </div>
        {roomCode && (
          <div className="card">
            <div className="ctitle">{t("players_found")} ({players.length})</div>
            {players.map(p => (
              <div key={p.uid} className="pi">
                <div className={`pav ${p.uid === myUid || p.uid === uid ? "pav-human" : "pav-guest"}`}>{p.name[0]}</div>
                <div><div className="pn">{p.name}</div><div className="ps">{p.country}</div></div>
                {p.isHost && <span className="hbadge">{t("host")}</span>}
                {p.ready && !p.isHost && <span className="rbadge">{t("ready")}</span>}
              </div>
            ))}
            {isHost && players.length >= 2 && (
              <button className="btn bp mt10" style={{ marginTop: 10 }} onClick={startGame}>🚀 Lancer ({players.length} joueurs)</button>
            )}
            {isHost && players.length < 2 && <p className="txm tc mt10" style={{ marginTop: 10 }}>{t("waiting_players_min")}</p>}
          </div>
        )}
      </div>
    </div>
  );

  if (step === "configure") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => setStep("choose")} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>⚙️ {t("game_settings","Paramètres")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        <div className="card">
          <div className="ctitle">{t("your_name2","Ton nom")}</div>
          <input className="inp" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={t("your_firstname","Prénom")} maxLength={20} />
        </div>

        <div className="card">
          <div className="ctitle">{t("difficulty_label","Difficulté")}</div>
          <div className="dg">
            {Object.entries(DIFFICULTY).map(([k, d]) => (
              <button key={k} className={`db ${hostDiff === k ? "sel" : ""}`}
                style={hostDiff === k ? { background: d.color, borderColor: "transparent" } : {}}
                onClick={() => setHostDiff(k)}>
                <div className="dd" style={{ background: d.color }} />
                {t(k, k)}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">{t("rounds_label","Manches")}</div>
          <div className="rounds-grid">
            {[3, 5, 10].map(n => (
              <button key={n} className={`rb ${hostRounds === n ? "sel" : ""}`} onClick={() => setHostRounds(n)}>{n}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">{t("categories_label","Catégories")} ({hostCats.length || ALL_BASE.length})</div>
          <div className="cg">
            {ALL_BASE.map(cat => {
              const sel = hostCats.length === 0 || hostCats.includes(cat.id);
              return (
                <button key={cat.id} className={`ct ${sel ? "ct-on" : ""}`}
                  onClick={() => {
                    if (hostCats.length === 0) {
                      // Tout sélectionné → décocher cette catégorie
                      setHostCats(ALL_BASE.map(c => c.id).filter(id => id !== cat.id));
                    } else if (sel) {
                      const next = hostCats.filter(id => id !== cat.id);
                      setHostCats(next.length === 0 ? ALL_BASE.map(c => c.id) : next);
                    } else {
                      setHostCats([...hostCats, cat.id]);
                    }
                  }}>
                  {cat.emoji} {getCatLabel(cat.id, lang || "fr")}
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn bp" onClick={() => setStep("private_create")}>
          {t("continue_btn","Continuer")} →
        </button>
      </div>
    </div>
  );

  if (step === "private_create" || step === "private_join") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { cleanup(); setStep(step === "private_create" ? "configure" : "choose"); }} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("private_room")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: "var(--rd)" }}>{error}</div>}
        {step === "private_create" ? (
          <div className="card">
            <div className="ctitle">{t("create_room","Créer un salon")}</div>
            <div style={{ fontSize: 12, color: "var(--txm)", marginBottom: 12 }}>
              <span>⚡ {t(hostDiff, hostDiff)} · 🔄 {hostRounds} {t("rounds_label","manches")} · 🗂 {hostCats.length || ALL_BASE.length} {t("categories_label","catégories")}</span>
            </div>
            <button className="btn bp" onClick={createPrivate} disabled={loading}>
              {loading ? <span className="spin">⟳</span> : t("create_room_private","Créer le salon")}
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="ctitle">{t("join_with_code","Rejoindre avec un code")}</div>
            <input className="inp" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ex: AB3C" maxLength={4}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 24, letterSpacing: 8, textAlign: "center", marginBottom: 12 }} />
            <button className="btn bp" onClick={() => joinPrivate()} disabled={joinCode.length < 4 || loading}>
              {loading ? <span className="spin">⟳</span> : t("join_btn","Rejoindre")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (step === "waiting") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { leaveRoom(); cleanup(); setStep("choose"); }} style={{ width: "auto" }}>✕</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{roomData?.type === "private" ? t("private_room") : "🌍 Public"} · {gameMode === "2v2" ? "🤝 2v2" : gameMode === "mort" ? "💀 Mort Subite" : "🌍 Multijoueur"}</span>
        <div style={{ width: 40 }} />
      </div>
      <div className="cnt">
        {roomData?.type === "private" && (
          <div className="card">
            <div className="ctitle">{t("room_code")}</div>
            <div className="rc">{roomCode}</div>
            <p className="txm tc">{t("share_code")}</p>
          </div>
        )}
        <div className="card">
          <div className="ctitle row jb" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t("players_count")} ({players.length}/6)</span>
            {!isHost && <span className="pulse txm">{t("waiting_host")}</span>}
          </div>
          {/* Liste joueurs — mode standard ou haut du 2v2 */}
          {gameMode !== "2v2" && players.map(p => (
            <div key={p.uid} className="pi">
              <div className={`pav ${p.uid === myUid || p.uid === uid ? "pav-human" : "pav-guest"}`}>{(p.name || "?")[0]}</div>
              <div><div className="pn">{p.name}{p.uid === myUid || p.uid === uid ? " " + t("its_you_paren","(toi)") : ""}</div><div className="ps">📍 {p.country}</div></div>
              {p.isHost && <span className="hbadge">{t("host")}</span>}
              {!p.isHost && p.ready && <span className="rbadge">{t("ready")}</span>}
              {!p.isHost && !p.ready && <span className="wbadge pulse">…</span>}
            </div>
          ))}

          {/* ── Éditeur d'équipes 2v2 (hôte seulement) ── */}
          {gameMode === "2v2" && (() => {
            const TEAM_DEFS = [
              { key: "team0", label: t("team_red","🔴 Équipe Rouge"), color: "#ef4444" },
              { key: "team1", label: t("team_blue","🔵 Équipe Bleu"),  color: "#3b82f6" },
              { key: "team2", label: t("team_green","🟢 Équipe Verte"), color: "#22c55e" },
            ];
            // Assignment: playerId → teamKey
            const assigned = customTeams || {};
            const unassigned = players.filter(p => !Object.values(assigned).includes(p.uid));
            function assignPlayer(uid, teamKey) {
              setCustomTeams(prev => {
                const n = {...(prev||{})};
                // Remove uid from all team slots
                Object.keys(n).forEach(k => { if (n[k] === uid) delete n[k]; });
                // Add to new slot only if assigning to a real team (not "none")
                if (teamKey !== "none") n[teamKey + "_" + uid] = uid;
                return n;
              });
            }
            const teamGroups = {};
            TEAM_DEFS.forEach(td => {
              teamGroups[td.key] = players.filter(p => {
                return Object.entries(assigned).some(([k, v]) => k.startsWith(td.key) && v === p.uid);
              });
            });
            return (
              <div>
                <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 8 }}>
                  {isHost ? t("assign_teams","Placez chaque joueur dans une équipe") : t("waiting_host","En attente de l'hôte…")}
                </div>
                {TEAM_DEFS.map(td => (
                  <div key={td.key} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: td.color, marginBottom: 4 }}>{td.label}</div>
                    <div style={{ minHeight: 36, background: td.color + "15", borderRadius: 8, border: `1px dashed ${td.color}40`, padding: "4px 8px", display:"flex", flexWrap:"wrap", gap:4 }}>
                      {teamGroups[td.key].map(p => (
                        <span key={p.uid} style={{ fontSize: 12, padding: "2px 8px", background: td.color + "30", borderRadius: 12, color: td.color }}>
                          {p.name}
                          {isHost && <button onClick={() => assignPlayer(p.uid, "none")} style={{ marginLeft:4, background:"none", border:"none", cursor:"pointer", color:td.color }}>✕</button>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {unassigned.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 4 }}>Joueurs non assignés :</div>
                    {unassigned.map(p => (
                      <div key={p.uid} className="pi" style={{ alignItems:"center" }}>
                        <div className={`pav ${p.uid === myUid ? "pav-human" : "pav-guest"}`}>{(p.name||"?")[0]}</div>
                        <div style={{ flex:1 }}><div className="pn">{p.name}</div></div>
                        {isHost && TEAM_DEFS.map(td => (
                          <button key={td.key} onClick={() => assignPlayer(p.uid, td.key)}
                            style={{ marginLeft:4, padding:"2px 8px", fontSize:11, background: td.color+"20", border:`1px solid ${td.color}60`, borderRadius:10, cursor:"pointer", color:td.color }}>
                            {td.label.split(" ")[1]}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {isHost && (
            <button className="btn bp mt10" style={{ marginTop: 10 }} onClick={startGame} disabled={players.length < 2}>
              {players.length < 2 ? t("waiting_players_short","En attente…") : `🚀 ${t("launch_btn","Lancer")} (${players.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────
function SetupScreen({
  mode, settings, setSettings, onStart, onBack, tier, onTier, lang
}) {
  const t = useT(lang || "fr");
  const [name, setName] = useState(settings.playerName);
  const [diff, setDiff] = useState(settings.difficulty);
  const [cats, setCats] = useState(settings.categories);
  const [cword, setCword] = useState("");
  const [customCats, setCustomCats] = useState(settings.customCategories || []);
  const [rounds, setRounds] = useState(settings.totalRounds || 5);
  // Mort Subite: nombre de catégories jouées par manche (3 ou 5)
  const [mortCatCount, setMortCatCount] = useState(settings.mortCatCount || 3);
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  const canVip = tier === TIER.VIP;
  const roundsOpts = ROUNDS_OPTIONS[tier] || [5];

  function toggleCat(id, ct) {
    if (ct === "pro" && !canPro) { onTier(); return; }
    if (ct === "vip" && !canVip) { onTier(); return; }
    setCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  function addCat() {
    if (!cword.trim()) return;
    const nc = { id: `c_${Date.now()}`, label: cword.trim(), emoji: "✏️", tier: "vip", custom: true };
    setCustomCats(p => [...p, nc]); setCats(p => [...p, nc.id]); setCword("");
  }
  function go() {
    if (!cats.length) return;
    const cfg = { mode, playerName: name, difficulty: diff, totalRounds: rounds, categories: cats, customCategories: customCats, mortCatCount };
    setSettings(s => ({ ...s, ...cfg }));
    onStart(cfg);
  }

  // Intentional: only reset rounds when tier changes; rounds/roundsOpts are derived from tier
  useEffect(() => { if (!roundsOpts.includes(rounds)) setRounds(roundsOpts[0]); }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  // Auto-expand categories when tier upgrades (derived state on tier change — intentional setState in effect)
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const freIds = FREE_CATS.map(c => c.id);
    const onlyFree = cats.length > 0 && cats.every(id => freIds.includes(id));
    if (canPro && onlyFree) setCats(ALL_BASE.map(c => c.id));
  }, [canPro]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={onBack} style={{ width: "auto" }}>{t("back_btn")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {/* BUG 5 FIX: dynamic title based on mode */}
          {({ solo: t("solo_vs_ia2"), "2v2": t("mode_2v2"), mort: t("mort_subite"), online: t("play_online") }[mode] || t("solo_vs_ia2"))}
        </span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt" style={{ overflowY: "auto" }}>
        <div className="card">
          <div className="ctitle">{t("your_name2")}</div>
          <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder={t("ob5_placeholder", "Comment t'appelles-tu ?")} />
        </div>
        <div className="card">
          <div className="ctitle">{t("difficulty")}</div>
          <div className="dg">{Object.entries(DIFFICULTY).map(([k, d]) => (
            <button key={k} className={`db ${diff === k ? "sel" : ""}`}
              style={diff === k ? { background: d.color + "22", borderColor: d.color, color: d.color } : {}} onClick={() => setDiff(k)}>
              <div className="dd" style={{ background: d.color }} />{d.label}
              <div style={{ fontSize: 10, marginTop: 2, opacity: .7 }}>{d.time}s</div>
            </button>
          ))}</div>
        </div>
        {mode !== "mort" && (
          <div className="card">
            <div className="ctitle">{t("rounds_label")}</div>
            <div className="rounds-grid">{roundsOpts.map(r => (
              <button key={r} className={`rb ${rounds === r ? "sel" : ""}`} onClick={() => setRounds(r)}>{r}</button>
            ))}</div>
          </div>
        )}
        {mode === "mort" && (
          <div className="card">
            <div className="ctitle">{t("cats_per_round","Catégories par manche")}</div>
            <p style={{ fontSize: 11, color: "var(--txm)", marginBottom: 8 }}>
              💀 {t("mort_desc2","Une erreur = éliminé. Le dernier en vie gagne !")}
            </p>
            <div className="rounds-grid">{[3, 5].map(n => (
              <button key={n} className={`rb ${mortCatCount === n ? "sel" : ""}`} onClick={() => setMortCatCount(n)}>
                {n}
              </button>
            ))}</div>
          </div>
        )}
        <div className="card">
          <div className="ctitle">{t("choose_categories")} ({cats.length})</div>
          <div className="cg">{[...ALL_BASE, ...customCats].map(cat => {
            const on = cats.includes(cat.id);
            const cc = cat.tier === "pro" ? "pro-c" : cat.tier === "vip" ? "vip-c" : "";
            const locked = (cat.tier === "pro" && !canPro) || (cat.tier === "vip" && !canVip);
            return (
              <button key={cat.id} className={`ct ${cc} ${on ? "on" : ""}`} onClick={() => toggleCat(cat.id, cat.tier)}>
                {cat.emoji} {getCatLabel(cat.id, lang || "fr")}{locked && <span style={{ fontSize: 8, opacity: .6 }}>{cat.tier === "pro" ? " PRO" : " VIP"}</span>}
              </button>
            );
          })}</div>
          <div className="div" />
          {canVip ? (
            <div className="row gap8">
              <input className="inp" value={cword} onChange={e => setCword(e.target.value)} placeholder={t("cat_custom")} onKeyDown={e => e.key === "Enter" && addCat()} style={{ flex: 1 }} />
              <button className="btn bp bsm" onClick={addCat} style={{ width: "auto" }}>+</button>
            </div>
          ) : (
            <button className="btn bvip bsm" onClick={onTier} style={{ width: "auto" }}>{t("vip_cats")}</button>
          )}
        </div>
        <button className="btn bp" onClick={go} disabled={!cats.length}>{t("launch_btn")}</button>
        <div style={{ height: 18 }} />
      </div>
    </div>
  );
}

// ─── ROULETTE ─────────────────────────────────────────────────────
function LetterRoulette({
  players, spinnerIndex, spinnerOrder, currentRound, totalRounds, myId, onLetterChosen, lang,
  forcedLetter, // lettre reçue depuis Firebase pour les non-spinners
  isOnline,     // true si partie en ligne (attend forcedLetter, pas de stop aléatoire local)
  usedLetters,  // lettres déjà utilisées dans cette partie — exclues du tirage
}) {
  const t = useT(lang || "fr");
  const [cur, setCur] = useState("A");
  const [locked, setLocked] = useState(false);
  const [lockedL, setLockedL] = useState(null);
  const ivRef = useRef(null);
  const lockedRef = useRef(false);

  // Pool de lettres disponibles (sans les lettres déjà utilisées)
  const availableAlphabet = ALPHABET.filter(l => !(usedLetters || []).includes(l));
  const pool = availableAlphabet.length > 0 ? availableAlphabet : ALPHABET;
  // Keep a ref to always have the latest pool inside the setInterval closure
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const spinnerId = spinnerOrder ? spinnerOrder[spinnerIndex % spinnerOrder.length] : players[spinnerIndex % players.length]?.id;
  const spinner = players.find(p => p.id === spinnerId || p.uid === spinnerId) || players[0];
  const isMyTurn = spinner?.id === myId || spinner?.uid === myId;

  useEffect(() => {
    ivRef.current = setInterval(() => {
      setCur(poolRef.current[Math.floor(Math.random() * poolRef.current.length)]);
      SoundFX.play("tick");
    }, 75);
    // Non-spinner en solo : stop aléatoire local
    // En ligne non-spinner : attendre forcedLetter depuis Firebase (ne pas faire de stop aléatoire)
    if (!isMyTurn && !isOnline) {
      setTimeout(() => { if (!lockedRef.current) doStop(poolRef.current[Math.floor(Math.random() * poolRef.current.length)]); }, 1400 + Math.random() * 800);
    }
    return () => clearInterval(ivRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand Firebase envoie la vraie lettre (mode online non-spinner)
  useEffect(() => {
    if (forcedLetter && !isMyTurn && !lockedRef.current) {
      doStop(forcedLetter);
    }
  }, [forcedLetter]); // eslint-disable-line react-hooks/exhaustive-deps

  function doStop(forceLetter) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    clearInterval(ivRef.current);
    const fl = forceLetter || cur;
    setCur(fl); setLocked(true); setLockedL(fl);
    SoundFX.play("lock");
    Haptics.success();
    setTimeout(() => onLetterChosen(fl), 900);
  }

  return (
    <div className="roul">
      <div className="roul-title">{t("round_label")} {currentRound} / {totalRounds}</div>
      <div className="roul-turn">
        {isMyTurn ? t("its_your_turn") : `🎲 ${spinner?.name || t("nav_play","Joueur")} ${t("spinner_rolling","{0} tourne…").replace("{0}","")}`}
      </div>
      <div className="roul-drum">
        <div className="roul-ring" /><div className="roul-ring2" /><div className="roul-ring3" />
        <div className={`roul-l ${locked ? "lock" : "spin"}`}>{locked ? lockedL : cur}</div>
      </div>
      {isMyTurn
        ? <button className="roul-btn" onClick={() => doStop()} disabled={locked}>{locked ? t("go_btn") : t("stop_btn2")}</button>
        : <div className="roul-waiting pulse">{locked ? t("letter_chosen").replace("{0}", lockedL || "") : `${spinner?.name} tourne…`}</div>
      }
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────
function GameScreen({
  gameState, setGameState, uid, lang, onEndGame
}) {
  const t = useT(lang || "fr");
  const timerRef = useRef(null);
  const aiRef = useRef(false);
  const doneRef = useRef(false);
  const inputRefs = useRef({});
  const { letter, categories, difficulty, players, phase, currentRound, totalRounds, spinnerIndex, myId } = gameState;
  // En mort subite, on joue uniquement les catégories actives du round courant
  const activeCategories = gameState.activeCategories || categories;
  const dc = DIFFICULTY[difficulty];


  // ── Listener Firebase pour sync lettre (mode online) ──────────
  // Toutes les mises à jour passent par un seul setGameState fonctionnel
  // pour éviter les stale closures et le reset du timer.
  useEffect(() => {
    if (!gameState.roomCode) return;
    const unsubscribe = FB.listenRoom(gameState.roomCode, (room) => {
      if (!room) return;
      setGameState(g => {
        let next = g;
        // Sync retour à la roulette (nouvelle manche – signal de l'hôte)
        if (room.phase === "roulette" && g.phase !== "roulette") {
          // Mort subite: reconstruire les catégories actives depuis les IDs broadcastés par l'hôte
          const nextActiveCats = room.activeCategoryIds
            ? room.activeCategoryIds.map(id => (g.categories || []).find(c => c.id === id)).filter(Boolean)
            : (g.activeCategories || g.categories || []);
          next = { ...next, phase: "roulette",
            spinnerOrder: room.spinnerOrder || g.spinnerOrder,
            spinnerIndex: room.spinnerIndex != null ? room.spinnerIndex : g.spinnerIndex,
            currentRound: room.currentRound || g.currentRound,
            pendingLetter: null,
            letter: null,
            usedLetters: room.usedLetters || g.usedLetters || [],
            activeCategories: nextActiveCats,
            answers: Object.fromEntries(nextActiveCats.map(c => [c.id, ""])),
            players: g.players.map(p => ({ ...p, answers: {}, done: false })),
          };
        }
        // Transition roulette → playing : stocker pendingLetter pour LetterRoulette
        // (LetterRoulette va appeler onLetterChosen qui transition réellement vers playing)
        // Ne PAS changer phase ici pour ne pas sauter l'animation de la roulette
        if (room.letter && room.letter !== g.pendingLetter && g.phase === "roulette") {
          next = { ...next, pendingLetter: room.letter };
        }
        // Sync lettre si déjà en playing (pas de reset timer !)
        if (g.phase === "playing" && room.letter && room.letter !== g.letter) {
          next = { ...next, letter: room.letter };
        }
        // Réponses des autres joueurs pendant le round (ne touche pas au timer)
        if (room.playerAnswers && g.phase === "playing") {
          const updatedPlayers = g.players.map(p => ({
            ...p,
            answers: room.playerAnswers?.[p.id || p.uid] || p.answers,
            done: room.playerDone?.[p.id || p.uid] ?? p.done,
          }));
          next = { ...next, players: updatedPlayers };
        }
        // ── BUG 1+4 FIX: fin de round signalée par Firebase ──────────
        // Sync toutes les réponses finales puis déclencher computeRoundScores
        // sur TOUS les clients simultanément via la phase "round_ended_sync"
        if (room.phase === "round_ended" && g.phase === "playing") {
          const updatedPlayers = g.players.map(p => {
            if (p.isBot) {
              // Générer les réponses des bots si pas encore fait
              const a = {};
              (g.activeCategories || g.categories || []).forEach(cat => {
                a[cat.id] = p.answers?.[cat.id] || getAiAnswer(cat.id, g.letter, g.lang || "fr");
              });
              return { ...p, answers: a, done: true };
            }
            const pid = p.id || p.uid;
            return { ...p, answers: room.playerAnswers?.[pid] || p.answers || {}, done: true };
          });
          next = { ...next, players: updatedPlayers, phase: "round_ended_sync" };
        }
        return next;
      });
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [gameState.mode, gameState.roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── BUG 1+4 FIX: déclencher computeRoundScores sur tous les clients ──
  useEffect(() => {
    if (gameState.phase !== "round_ended_sync") return;
    computeRoundScores(gameState);
  }, [gameState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GARDE-FOU PÉRIODIQUE: une manche ne doit jamais rester bloquée en
  // "playing" indéfiniment si un joueur disparaît (déconnexion, tab fermé)
  // sans avoir soumis ses réponses. Le garde-fou dans handleStop() ne se
  // vérifie qu'une fois, au moment où CHAQUE joueur soumet — si tous les
  // joueurs encore présents soumettent avant l'expiration du délai de grâce,
  // personne ne revérifie plus tard et la manche reste bloquée pour toujours.
  // Ce watchdog tourne en continu tant qu'on est en phase "playing" (que ce
  // client ait déjà soumis ou non) et force la fin de manche si le délai de
  // grâce est dépassé, peu importe qui a fini.
  useEffect(() => {
    if (!gameState.roomCode || gameState.phase !== "playing") return;
    const interval = setInterval(async () => {
      try {
        const room = await FB.getRoom(gameState.roomCode);
        if (!room || room.phase !== "playing" || !room.letterChosenAt) return;
        const elapsedMs = Date.now() - room.letterChosenAt;
        const graceMs = (gameState.totalTime + 10) * 1000;
        if (elapsedMs > graceMs) {
          await FB.updateRoom(gameState.roomCode, {
            phase: "round_ended",
            roundEndedAt: Date.now(),
          });
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState.roomCode, gameState.phase, gameState.totalTime]);

  useEffect(() => { aiRef.current = false; doneRef.current = false; }, [currentRound]);

  useEffect(() => {
    if (phase !== "playing" || !letter || aiRef.current) return;
    aiRef.current = true;
    players.filter(p => p.isBot).forEach((bot, bi) => {
      setTimeout(() => {
        if (doneRef.current) return;
        const a = {}; activeCategories.forEach(cat => { a[cat.id] = getAiAnswer(cat.id, letter, gameState?.lang || lang); });
        setGameState(g => ({ ...g, players: g.players.map(p => p.id === bot.id ? { ...p, answers: a, done: true } : p) }));
      }, dc.aiDelay + bi * 700 + Math.random() * 900);
    });
    timerRef.current = setInterval(() => {
      setGameState(g => {
        if (g.timeLeft <= 1) { clearInterval(timerRef.current); return { ...g, timeLeft: 0 }; }
        return { ...g, timeLeft: g.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, letter, currentRound]); // Intentional: omit players/lang/dc to avoid timer reset on every re-render

  useEffect(() => {
    if (gameState.timeLeft <= 0 && phase === "playing" && !doneRef.current) handleStop();
  }, [gameState.timeLeft, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStop() {
    if (doneRef.current) return;
    doneRef.current = true; clearInterval(timerRef.current);
    SoundFX.play("stop");
    Haptics.heavy();
    const finalPlayers = gameState.players.map(p => {
      if (!p.isBot) return p;
      const a = {}; activeCategories.forEach(cat => { a[cat.id] = p.answers?.[cat.id] || getAiAnswer(cat.id, gameState.letter, gameState?.lang || lang); });
      return { ...p, answers: a, done: true };
    });
    // En mode online: pousser les réponses d'abord, puis signaler la fin du round.
    // Séparer les deux écritures évite que les autres clients reçoivent "round_ended"
    // avant d'avoir les réponses du joueur (race condition).
    if (gameState.roomCode && gameState.myId) {
      // Lire les réponses depuis le state fonctionnel pour éviter la stale closure
      setGameState(g => {
        const latestAnswers = g.answers || {};
        const myId = g.myId;
        // Mark local human player as done immediately (UI feedback)
        const updatedPlayers = g.players.map(p =>
          (p.id === myId || p.uid === myId) ? { ...p, done: true } : p
        );
        // Pousser les réponses sur Firebase puis signaler la fin du round.
        // RACE CONDITION FIX: ne déclencher "round_ended" que lorsque TOUS les
        // joueurs encore présents dans la room ont soumis (playerDone[uid] === true).
        // Sinon deux clients peuvent calculer les scores à des instants différents
        // avec des réponses partielles → scores divergents entre joueurs.
        // Garde-fou: si le round dure depuis plus que le temps imparti + marge,
        // on force la fin malgré tout (joueur déconnecté sans avoir répondu).
        FB.updateRoom(g.roomCode, {
          [`playerAnswers/${myId}`]: latestAnswers,
          [`playerDone/${myId}`]: true,
        }).then(() => FB.getRoom(g.roomCode)).then(room => {
          if (!room || room.phase !== "playing") return; // déjà avancé par un autre client
          const playerIds = Object.keys(room.players || {});
          const allDone = playerIds.every(pid => room.playerDone?.[pid] === true);
          const elapsedMs = room.letterChosenAt ? Date.now() - room.letterChosenAt : 0;
          const graceMs = (g.totalTime + 10) * 1000;
          if (allDone || elapsedMs > graceMs) {
            return FB.updateRoom(g.roomCode, {
              phase: "round_ended",
              roundEndedAt: Date.now(),
            });
          }
          // Pas encore tout le monde — le dernier joueur à finir (ou le garde-fou
          // du prochain à écrire) déclenchera round_ended.
        }).catch(() => {});
        return { ...g, players: updatedPlayers };
      });
      // Le listener Firebase synce les réponses de tous et déclenche computeRoundScores
      return;
    }
    // Mode offline uniquement
    computeRoundScores({ ...gameState, players: finalPlayers });
  }

  function computeRoundScores(gs) {
    const roundScores = {};
    gs.players.forEach(p => { roundScores[p.id] = 0; });
    const roundAnswers = {};
    const roundValidity = {};

    // En mort subite, utiliser les catégories actives du round
    const catsToScore = gs.activeCategories || gs.categories;

    catsToScore.forEach(cat => {
      // BUG 4 FIX: each player's answer comes from p.answers for bots and online players,
      // and from gs.answers only for the local human player
      const myId = gs.myId;
      const allAns = gs.players.map(p => {
        if (p.isBot) return p.answers?.[cat.id] || "";
        if (p.id === myId) return gs.answers?.[cat.id] || "";
        return p.answers?.[cat.id] || ""; // other online human players
      });
      roundAnswers[cat.id] = {};
      roundValidity[cat.id] = {};
      gs.players.forEach(p => {
        const mine = (p.isBot || p.id !== myId)
          ? (p.answers?.[cat.id] || "")
          : (gs.answers?.[cat.id] || "");
        const rawPts = gs.isTournoi
          ? scoreAnswerTournoi(mine, allAns, cat.id, gs.letter, gs.lang || "fr", 0)
          : scoreAnswer(mine, allAns, cat.id, gs.letter, gs.lang || "fr");
        const pts = typeof rawPts === "object" ? (rawPts.pts ?? 0) : rawPts;
        roundScores[p.id] += pts > 0 ? pts : 0;
        roundAnswers[cat.id][p.id] = mine;
        roundValidity[cat.id][p.id] = pts;
      });
    });

    // ── Mode Mort Subite ─────────────────────────────────────
    // UNE seule erreur (réponse invalide OU vide) = éliminé immédiatement
    let eliminatedIds = [];
    if (gs.mode === "mort") {
      const activeCatsForRound = gs.activeCategories || gs.categories;
      gs.players.forEach(p => {
        if (p.eliminated) return; // déjà éliminé
        const hasError = activeCatsForRound.some(cat => {
          const v = roundValidity[cat.id]?.[p.id];
          const ans = roundAnswers[cat.id]?.[p.id] || "";
          return !ans.trim() || v === -1; // vide OU invalide
        });
        if (hasError) eliminatedIds.push(p.id);
      });
    }

    // ── Mode 2v2 ─────────────────────────────────────────────
    // Équipes dynamiques: moitié gauche vs moitié droite
    let teamScores = null;
    if (gs.mode === "2v2") {
      const playerIds = gs.players.map(p => p.id);
      const half = Math.ceil(playerIds.length / 2);
      const teams = gs.teams || {
        team0: playerIds.slice(0, half),
        team1: playerIds.slice(half),
      };
      teamScores = {};
      Object.entries(teams).forEach(([teamId, memberIds]) => {
        teamScores[teamId] = memberIds.reduce((sum, pid) => sum + (roundScores[pid] || 0), 0);
      });
    }

    const newCumulative = {};
    gs.players.forEach(p => {
      newCumulative[p.id] = (gs.cumulativeScores[p.id] || 0) + roundScores[p.id];
    });

    // Joueurs restants en mort subite
    const activePlayers = gs.mode === "mort"
      ? gs.players.filter(p => !p.eliminated && !eliminatedIds.includes(p.id))
      : gs.players;

    // Mort Subite: on continue jusqu'au dernier survivant (ignore totalRounds)
    const isLast = gs.mode === "mort"
      ? activePlayers.length <= 1
      : gs.currentRound >= gs.totalRounds;

    const updatedPlayers = gs.players.map(p => ({
      ...p,
      eliminated: p.eliminated || eliminatedIds.includes(p.id),
    }));

    const roundData = {
      letter: gs.letter,
      answers: roundAnswers,
      scores: roundScores,
      validity: roundValidity,
      eliminated: eliminatedIds,
      teamScores,
      activeCategories: gs.activeCategories || gs.categories,
    };

    // Vérifier si une phase de vote VIP est nécessaire (catégories custom)
    const customCatsInRound = (gs.activeCategories || gs.categories).filter(c => c.custom);
    const needsVote = customCatsInRound.length > 0;

    const newGs = {
      ...gs,
      players: updatedPlayers,
      rounds: [...gs.rounds, roundData],
      cumulativeScores: newCumulative,
      currentRoundData: roundData,
      phase: needsVote ? "vote_phase" : (isLast ? "final_results" : "round_results"),
      teamScores: teamScores || gs.teamScores,
      _pendingIsLast: isLast,
    };
    setGameState(newGs);
    if (!needsVote && isLast) setTimeout(() => onEndGame(newGs), 0);
  }

  function upd(id, v) { setGameState(g => ({ ...g, answers: { ...g.answers, [id]: v } })); }
  const allFilled = activeCategories.every(cat => gameState.answers[cat.id]?.trim().length > 0);

  if (phase === "roulette") {
    const spinnerIdForRender = gameState.spinnerOrder
      ? gameState.spinnerOrder[spinnerIndex % gameState.spinnerOrder.length]
      : players[spinnerIndex % players.length]?.id;
    const amSpinner = spinnerIdForRender === (myId || uid) ||
      players.find(p => p.id === spinnerIdForRender)?.uid === (myId || uid);
    return (
      <LetterRoulette
        players={players} spinnerIndex={spinnerIndex}
        spinnerOrder={gameState.spinnerOrder} currentRound={currentRound} totalRounds={totalRounds}
        myId={myId || uid}
        forcedLetter={gameState.pendingLetter}
        isOnline={!!gameState.roomCode}
        usedLetters={gameState.usedLetters || []}
        onLetterChosen={async l => {
          // Mettre à jour l'état local (transition roulette → playing)
          setGameState(g => ({ ...g, letter: l, pendingLetter: l, phase: "playing", timeLeft: g.totalTime, usedLetters: [...(g.usedLetters || []), l] }));
          // En mode online: SEUL le spinner publie la lettre sur Firebase
          if (gameState.roomCode && amSpinner) {
            try {
              await FB.updateRoom(gameState.roomCode, {
                letter: l,
                phase: "playing",
                letterChosenAt: Date.now(),
                usedLetters: [...(gameState.usedLetters || []), l], // BUG 3 FIX: persister les lettres utilisées
              });
            } catch { /* ignore */ }
          }
        }}
      lang={lang} />
    );
  }

  if (phase === "vote_phase") {
    return (
      <VotePhase
        gameState={gameState}
        onVoteDone={updatedGs => {
          setGameState(updatedGs);
          if (updatedGs._pendingIsLast) setTimeout(() => onEndGame(updatedGs), 0);
        }}
        lang={lang}
      />
    );
  }

  if (phase === "round_results") {
    return (
    <RoundResultsOverlay gameState={gameState} onNext={() => {
      // En mode online, seul l'hôte avance le round — les non-hôtes attendent le listener Firebase
      if (gameState.roomCode && !gameState.isHost) return;

      // Calculer le prochain état ici pour pouvoir écrire sur Firebase
      let nextActiveCats = gameState.activeCategories || gameState.categories;
      if (gameState.mode === "mort" && gameState.mortCatCount) {
        const pool = gameState.categories;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        nextActiveCats = shuffled.slice(0, Math.min(gameState.mortCatCount, shuffled.length));
      }
      const nextRound = gameState.currentRound + 1;
      const activePlayers = gameState.players.filter(p => !p.eliminated);
      // En mode online, spinnerOrder contient TOUS les joueurs (y compris éliminés) — utiliser sa longueur comme modulo
      // pour éviter un index hors-bornes qui saute des spinners ou lève une exception côté LetterRoulette.
      const spinnerPoolLength = gameState.spinnerOrder ? gameState.spinnerOrder.length : activePlayers.length;
      const nextSpinner = spinnerPoolLength > 0 ? (gameState.spinnerIndex + 1) % spinnerPoolLength : 0;
      setGameState(g => ({
        ...g,
        currentRound: nextRound,
        spinnerIndex: nextSpinner,
        letter: null,
        pendingLetter: null, // FIX: reset pour que forcedLetter ne rejoue pas l'ancienne lettre
        activeCategories: nextActiveCats,
        answers: Object.fromEntries(nextActiveCats.map(c => [c.id, ""])),
        players: g.players.map(p => ({ ...p, answers: {}, done: false })),
        phase: "roulette",
        timeLeft: g.totalTime,
      }));
      // En mode online: l'hôte broadcast la nouvelle manche à tous les clients
      if (gameState.roomCode && gameState.isHost) {
        FB.updateRoom(gameState.roomCode, {
          phase: "roulette",
          currentRound: nextRound,
          spinnerIndex: nextSpinner,
          letter: null,
          playerAnswers: null,
          playerDone: null,
          // Mort subite: syncer les catégories actives du prochain round
          activeCategoryIds: nextActiveCats.map(c => c.id),
          // Syncer les lettres déjà utilisées pour que LetterRoulette les exclue côté clients
          // NB: gameState.usedLetters already contains gameState.letter (added in onLetterChosen)
          usedLetters: (gameState.usedLetters || []).filter(Boolean),
        }).catch(() => {});
      }
    }} lang={lang} />
  );
  }

  if (phase === "final_results") return null;

  const pct = (gameState.timeLeft / gameState.totalTime) * 100;
  const tc = pct > 50 ? "var(--gn)" : pct > 25 ? "var(--yw)" : "var(--rd)";
  const myId2 = gameState.myId || uid || "human";

  return (
    <div className="gwrap">
      {/* Header: lettre + timer + round */}
      <div className="ghdr">
        <div className="glbadge">{letter}</div>
        <div className="tbar-w">
          <div className="tbar"><div className="tfill" style={{ width: `${pct}%`, background: tc }} /></div>
          <div className="ttxt" style={{ color: tc }}>{gameState.timeLeft}s</div>
        </div>
        <div className="round-badge">{t("round_label")}<br /><strong>{currentRound}/{totalRounds}</strong></div>
      </div>

      {/* Scrollable category list */}
      <div className="catlist">

        {/* ── Current round inputs EN HAUT ── */}
        {activeCategories.map((cat, i) => {
          const val = gameState.answers[cat.id] || "";
          const filled = val.trim().length > 0;
          return (
            <div key={cat.id} className={`catrow ${filled ? "active" : ""}`}
              onClick={() => inputRefs.current[cat.id]?.focus()}>
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{getCatLabel(cat.id, lang || "fr")}{cat.custom ? " ✏️" : ""}</span>
              <input
                ref={el => inputRefs.current[cat.id] = el}
                className="cat-input"
                value={val}
                onChange={e => upd(cat.id, e.target.value)}
                placeholder={`${letter}…`}
                autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck="false"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const nx = activeCategories[i + 1];
                    if (nx) inputRefs.current[nx.id]?.focus();
                    else inputRefs.current[cat.id]?.blur();
                  }
                }}
              />
              <span className="cat-pts v0">—</span>
            </div>
          );
        })}

        {/* ── Past rounds EN BAS (lecture seule) ── */}
        {gameState.rounds.map((rd, ri) => {
          const rdCats = rd.activeCategories || categories;
          const roundTotal = rdCats.reduce((s, cat) => {
            const v = rd.validity?.[cat.id]?.[myId2] ?? 0;
            return s + (v > 0 ? v : 0);
          }, 0);
          return (
            <div key={ri}>
              <div className="round-sep">
                <span>{t("round_label")} {ri + 1} — {rd.letter}</span>
                <div className="round-sep-line" />
                <span className="round-total-chip">{roundTotal}{t("pts","pts")}</span>
              </div>
              {rdCats.map(cat => {
                const ans = rd.answers?.[cat.id]?.[myId2] || "";
                const v = rd.validity?.[cat.id]?.[myId2] ?? 0;
                const vc = !ans ? "v0" : v === -1 ? "vm" : v === 2 ? "v2" : v === 1 ? "v1" : "v0";
                return (
                  <div key={cat.id} className="catrow-past">
                    <span className="cat-emoji">{cat.emoji}</span>
                    <span className="cat-label">{getCatLabel(cat.id, lang || "fr")}</span>
                    <span className={`past-answer ${vc}`}>
                      {ans.trim() ? ans : "—"}{ans.trim() && v !== -1 && <span style={{ fontSize: 10, opacity: .7 }}> +{Math.max(0, v)}</span>}
                      {ans.trim() && v === -1 && <span style={{ fontSize: 10 }}> ❌</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Stop bar */}
      <div className="sbar">
        {allFilled ? (
          <button className="sbtn" style={{ background: "var(--gn)", boxShadow: "0 0 24px rgba(74,222,128,0.35)", letterSpacing: 1 }} onClick={handleStop}>
            {t("filled_all")}
          </button>
        ) : (
          <button className="sbtn" onClick={handleStop}>{t("stop_btn")}</button>
        )}
      </div>
    </div>
  );
}

// ─── VOTE PHASE (catégories custom VIP) ──────────────────────────
// Quand une ou plusieurs catégories custom sont jouées, les joueurs votent
// simultanément pour valider les réponses des autres.
// Règles :
//   • Majorité pour = réponse validée (points normaux)
//   • Égalité = 1 pt seulement
//   • Majorité contre = 0 pt
// L'auteur de la réponse NE vote PAS sur sa propre réponse.
function VotePhase({ gameState, onVoteDone, lang }) {
  const t = useT(lang || "fr");
  const { players, currentRoundData, myId } = gameState;
  const customCats = (gameState.activeCategories || gameState.categories).filter(c => c.custom);

  // votes[catId][targetPlayerId] = "yes" | "no"  (votes du joueur local)
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Init bot votes (aléatoires — 70% oui, 30% non)
  useEffect(() => {
    const botVotes = {};
    players.filter(p => p.isBot).forEach(bot => {
      customCats.forEach(cat => {
        players.filter(p => p.id !== bot.id).forEach(target => {
          const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
          if (!ans.trim()) return; // skip blank answers — no vote needed
          const key = `${bot.id}:${cat.id}:${target.id}`;
          botVotes[key] = Math.random() > 0.3 ? "yes" : "no";
        });
      });
    });
    setVotes(prev => ({ ...prev, ...botVotes })); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function castVote(catId, targetId, v) {
    setVotes(prev => ({ ...prev, [`${myId}:${catId}:${targetId}`]: v }));
  }

  // Vérifier si le joueur humain a voté sur toutes les réponses non-vides des autres
  const pendingHumanVotes = customCats.flatMap(cat =>
    players
      .filter(p => p.id !== myId)
      .filter(p => (currentRoundData.answers?.[cat.id]?.[p.id] || "").trim())
      .filter(p => !votes[`${myId}:${cat.id}:${p.id}`])
  );
  const canSubmit = pendingHumanVotes.length === 0;

  function applyVotesAndFinish() {
    setSubmitted(true);
    // Recalculer les scores pour les catégories custom
    const updatedCumulative = { ...gameState.cumulativeScores };
    const updatedRoundData = { ...currentRoundData };

    customCats.forEach(cat => {
      players.forEach(target => {
        const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
        if (!ans.trim()) return; // réponse vide — pas de vote
        // Compter les votes de tous les joueurs SAUF l'auteur
        const voters = players.filter(p => p.id !== target.id);
        const yesVotes = voters.filter(v => {
          const key = `${v.id}:${cat.id}:${target.id}`;
          return votes[key] === "yes";
        }).length;
        const noVotes = voters.length - yesVotes;
        let catPts;
        if (yesVotes > noVotes) {
          // Majorité pour → points normaux (déjà calculés, on les garde)
          catPts = currentRoundData.validity?.[cat.id]?.[target.id] ?? 0;
          catPts = catPts > 0 ? catPts : 0;
        } else if (yesVotes === noVotes) {
          catPts = 1; // Égalité → 1 pt
        } else {
          catPts = 0; // Majorité contre → 0 pt
        }
        // Remplacer le score existant pour cette cat par le résultat du vote
        const oldPts = currentRoundData.validity?.[cat.id]?.[target.id] ?? 0;
        const diff = catPts - (oldPts > 0 ? oldPts : 0);
        updatedCumulative[target.id] = (updatedCumulative[target.id] || 0) + diff;
        // Stocker le résultat du vote pour l'affichage
        if (!updatedRoundData.voteResults) updatedRoundData.voteResults = {};
        if (!updatedRoundData.voteResults[cat.id]) updatedRoundData.voteResults[cat.id] = {};
        updatedRoundData.voteResults[cat.id][target.id] = { yesVotes, noVotes, catPts };
      });
    });

    const nextPhase = gameState._pendingIsLast ? "final_results" : "round_results";
    const updatedGs = {
      ...gameState,
      cumulativeScores: updatedCumulative,
      currentRoundData: updatedRoundData,
      phase: nextPhase,
    };
    onVoteDone(updatedGs);
  }

  return (
    <div className="rov">
      <div className="rpanel">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          🗳️ {t("vote_phase_title","Vote — Catégorie perso")}
        </div>
        <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 14 }}>
          {t("vote_info","Votez pour valider les réponses des catégories créées par l'hôte")}
        </div>

        {customCats.map(cat => (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              {cat.emoji} {cat.label}
            </div>
            {players.map(target => {
              const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
              if (!ans.trim()) return null;
              const isMe = target.id === myId;
              const myVote = votes[`${myId}:${cat.id}:${target.id}`];
              // Compter les votes déjà enregistrés (bots)
              const voters = players.filter(p => p.id !== target.id);
              const yesCount = voters.filter(v => votes[`${v.id}:${cat.id}:${target.id}`] === "yes").length;
              const noCount = voters.filter(v => votes[`${v.id}:${cat.id}:${target.id}`] === "no").length;
              return (
                <div key={target.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", marginBottom: 6,
                  background: "var(--sf2)",
                  borderRadius: 10, border: "1px solid var(--br)"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--txm)" }}>
                      {target.isBot ? "🤖" : "👤"} {target.name}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{ans}</div>
                  </div>
                  {isMe ? (
                    <span style={{ fontSize: 11, color: "var(--txm)", fontStyle: "italic" }}>
                      (ta réponse)
                    </span>
                  ) : submitted ? (
                    <span style={{ fontSize: 11, color: "var(--txm)" }}>
                      {yesCount > noCount ? t("vote_result_ok","✅") : yesCount === noCount ? t("vote_result_tie","⚖️ 1pt") : t("vote_result_no","❌")}
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => castVote(cat.id, target.id, "yes")}
                        style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          background: myVote === "yes" ? "rgba(74,222,128,0.25)" : "var(--sf2)",
                          border: myVote === "yes" ? "1px solid #4ade80" : "1px solid var(--br)",
                          color: myVote === "yes" ? "#4ade80" : "inherit",
                        }}>
                        {t("vote_validate","✓")}
                      </button>
                      <button
                        onClick={() => castVote(cat.id, target.id, "no")}
                        style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          background: myVote === "no" ? "rgba(248,113,113,0.25)" : "var(--sf2)",
                          border: myVote === "no" ? "1px solid #f87171" : "1px solid var(--br)",
                          color: myVote === "no" ? "#f87171" : "inherit",
                        }}>
                        {t("vote_reject","✗")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {!submitted && (
          <button
            className="btn bp"
            onClick={applyVotesAndFinish}
            disabled={!canSubmit}
            style={{ marginTop: 8 }}>
            {canSubmit ? t("vote_submit","Confirmer mes votes") : `${pendingHumanVotes.length} vote(s) restant(s)`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ROUND RESULTS ────────────────────────────────────────────────
function RoundResultsOverlay({
  gameState, onNext, lang
}) {
  const t = useT(lang || "fr");
  const { players, currentRoundData, cumulativeScores, currentRound, totalRounds } = gameState;
  if (!currentRoundData) return null;
  // Utiliser les catégories du round (peut être un sous-ensemble en mort subite)
  const roundCats = currentRoundData.activeCategories || gameState.activeCategories || gameState.categories;
  const { letter, answers: rAns, scores: rScores } = currentRoundData;
  const sorted = [...players].sort((a, b) => (cumulativeScores[b.id] || 0) - (cumulativeScores[a.id] || 0));
  const max = cumulativeScores[sorted[0]?.id] || 0;

  return (
    <div className="rov">
      <div className="rpanel">
        <div className="row jb" style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{t("round")} {currentRound} — {t("round_history")}</div>
            <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{t("letter_label","Lettre :")} <strong style={{ color: "var(--ac)" }}>{letter}</strong></div>
          </div>
          <div style={{ fontSize: 11, color: "var(--txm)" }}>{currentRound}/{totalRounds}</div>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 14 }}>
          <table className="stable">
            <thead><tr>
              <th style={{ textAlign: "left" }}>{t("category_col")}</th>
              {players.map(p => <th key={p.id}>{p.isBot ? "🤖" : "👤"} {p.name.split(" ")[0]}</th>)}
            </tr></thead>
            <tbody>
              {roundCats.map(cat => {
                const allAns = players.map(p => rAns[cat.id]?.[p.id] || "");
                const voteResult = currentRoundData.voteResults?.[cat.id];
                return (
                  <tr key={cat.id}>
                    <td className="td-player">
                      {cat.emoji} {getCatLabel(cat.id, lang || "fr")}
                      {cat.custom && <span style={{ fontSize: 9, opacity: .7 }}> 🗳️</span>}
                    </td>
                    {players.map(p => {
                      const ans = rAns[cat.id]?.[p.id] || "";
                      let pts = currentRoundData.validity?.[cat.id]?.[p.id] ?? scoreAnswer(ans, allAns, cat.id, letter, gameState?.lang);
                      // Pour les cats custom: afficher le résultat du vote
                      if (cat.custom && voteResult?.[p.id] !== undefined) {
                        pts = voteResult[p.id].catPts;
                      }
                      const invalid = pts === -1 || (cat.custom && voteResult?.[p.id]?.catPts === 0 && ans.trim());
                      const cc = pts === 2 ? "pts-2" : pts === 1 ? "pts-1" : "pts-0";
                      const voteInfo = cat.custom && voteResult?.[p.id];
                      return (
                        <td key={p.id}>
                          <div style={{ fontSize: 11, textDecoration: invalid ? "line-through" : "none", color: invalid ? "var(--rd)" : "inherit" }}>
                            {ans.trim() ? ans : <em style={{ color: "var(--txm)" }}>—</em>}
                          </div>
                          <div className={`td-pts ${cc}`}>
                            {invalid ? "❌" : `+${Math.max(0,pts)}pt`}
                          </div>
                          {voteInfo && (
                            <div style={{ fontSize: 9, color: "var(--txm)" }}>
                              {voteInfo.yesVotes}✓ {voteInfo.noVotes}✗
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className="td-player" style={{ color: "var(--txm)", fontSize: 10 }}>{t("this_round")}</td>
                {players.map(p => <td key={p.id} className="td-total">+{rScores[p.id] || 0}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ctitle">{t("cumul_score")}</div>
        {sorted.map((p, i) => (
          <div key={p.id} className={`srow ${cumulativeScores[p.id] === max ? "win" : ""}`}>
            <div className="srank">{i + 1}</div>
            <div className="sname">{p.isBot ? "🤖" : "👤"} {p.name}{cumulativeScores[p.id] === max ? " ⚡" : ""}</div>
            <div className="spts">{cumulativeScores[p.id] || 0}pts</div>
          </div>
        ))}
        {/* XP gained this round */}
        {(() => {
          // Use myId from gameState (set correctly for both solo and online modes)
          const humanId = gameState.myId || players.find(p=>!p.isBot)?.id || "";
          return (
            <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, color: "var(--ac)", fontWeight: 700 }}>
              +{calcXpGain(currentRoundData?.scores?.[humanId] || 0, false, gameState.totalRounds || 1)} {t("xp")} ⚡
            </div>
          );
        })()}
        {/* En mode online, seul l'hôte peut avancer — les autres voient un message d'attente */}
        {gameState.roomCode && !gameState.isHost ? (
          <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, color: "var(--txm)" }} className="pulse">
            ⏳ {t("waiting_host","En attente de l'hôte…")}
          </div>
        ) : (
          <button className="btn bp" style={{ marginTop: 8 }} onClick={onNext}>
            ▶ {t("round_label")} {currentRound + 1} / {totalRounds}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FINAL RESULTS ────────────────────────────────────────────────
function FinalResultsScreen({ gameState, onPlayAgain, onHome, uid, lang }) {
  const t = useT(lang || "fr");
  const { players, cumulativeScores, rounds, totalRounds } = gameState;
  const sorted = [...players].sort((a, b) => (cumulativeScores[b.id] || 0) - (cumulativeScores[a.id] || 0));
  const max = cumulativeScores[sorted[0]?.id] || 0;
  const myId = gameState.myId || uid;
  const myScore = cumulativeScores[myId] || 0;
  // Victoire exclusive : mon score est le max ET personne d'autre n'a le même score
  const allScores = Object.values(cumulativeScores || {});
  const iWon = myScore === max && allScores.filter(s => s === max).length === 1;

  // ── Compute awards per player ────────────────────────────────────
  function computeAwards() {
    if (!rounds || rounds.length === 0) return [];

    const awards = [];

    // Helper: get all answers for a player across all rounds
    const allAnswers = (pid) => rounds.flatMap(r =>
      Object.values(r.answers || {}).map(catAnswers => catAnswers?.[pid] || "")
    ).filter(a => a?.trim());

    // Helper: get validity scores for a player
    const allValidity = (pid) => rounds.flatMap(r =>
      Object.entries(r.validity || {}).map(([, catV]) => catV?.[pid] ?? 0)
    );

    // 1. 🏆 Meilleur score → winner (already shown)
    // 2. ⚡ Le plus rapide → player who called STOP most often (whichever had most unique answers = proxy)
    const uniqueCountByPlayer = {};
    players.forEach(p => {
      uniqueCountByPlayer[p.id] = allValidity(p.id).filter(v => v === 2).length;
    });
    const fastestId = Object.entries(uniqueCountByPlayer).sort((a,b) => b[1]-a[1])[0]?.[0];
    const fastest = players.find(p => p.id === fastestId);
    if (fastest) awards.push({ player: fastest, icon: "⚡", title: t("award_fastest"), desc: `${uniqueCountByPlayer[fastestId]} ${t("award_unique_desc")}` });

    // 3. 🎨 Le plus inventif → most different words (longest avg word)
    const avgWordLen = {};
    players.forEach(p => {
      const words = allAnswers(p.id).filter(w => w.trim());
      avgWordLen[p.id] = words.length > 0 ? words.reduce((s,w) => s + w.length, 0) / words.length : 0;
    });
    const inventifId = Object.entries(avgWordLen).sort((a,b) => b[1]-a[1])[0]?.[0];
    const inventif = players.find(p => p.id === inventifId);
    if (inventif && inventifId !== fastestId) {
      // BUG 9 FIX: use t("award_avglen_desc") instead of hardcoded French
      awards.push({ player: inventif, icon: "🎨", title: t("award_creative"), desc: `${avgWordLen[inventifId].toFixed(1)} ${t("award_avglen_desc")}` });
    }

    // 4. 🦁 Le plus courageux → most answers submitted (never left blank)
    const filledCount = {};
    players.forEach(p => { filledCount[p.id] = allAnswers(p.id).length; });
    const courageuxId = Object.entries(filledCount).sort((a,b) => b[1]-a[1])[0]?.[0];
    const courageux = players.find(p => p.id === courageuxId);
    if (courageux) awards.push({ player: courageux, icon: "🦁", title: t("award_brave"), desc: `${filledCount[courageuxId]} ${t("award_filled_desc")}` });

    // 5. 💀 La tête de mule → most shared answers (same word as others)
    const sharedCount = {};
    players.forEach(p => { sharedCount[p.id] = allValidity(p.id).filter(v => v === 1).length; });
    const teteMuleId = Object.entries(sharedCount).sort((a,b) => b[1]-a[1])[0]?.[0];
    const teteMule = players.find(p => p.id === teteMuleId);
    if (teteMule) awards.push({ player: teteMule, icon: "💀", title: t("award_stubborn"), desc: `${sharedCount[teteMuleId]} ${t("award_shared_desc")}` });

    // 6. 🌟 L'érudit → best average score per round
    const avgScore = {};
    players.forEach(p => {
      const roundScores = rounds.map(r => r.scores?.[p.id] || 0);
      avgScore[p.id] = roundScores.length > 0 ? roundScores.reduce((s,v)=>s+v,0)/roundScores.length : 0;
    });
    const eruditId = Object.entries(avgScore).sort((a,b) => b[1]-a[1])[0]?.[0];
    const erudit = players.find(p => p.id === eruditId);
    if (erudit) awards.push({ player: erudit, icon: "🌟", title: t("award_scholar"), desc: `${avgScore[eruditId].toFixed(1)} ${t("award_avg_desc")}` });

    // 7. 😅 Le chanceux → best single round score
    let bestRound = { pid: null, score: 0 };
    rounds.forEach(r => {
      players.forEach(p => {
        const s = r.scores?.[p.id] || 0;
        if (s > bestRound.score) bestRound = { pid: p.id, score: s };
      });
    });
    const chanceux = players.find(p => p.id === bestRound.pid);
    if (chanceux && bestRound.pid !== eruditId) {
      awards.push({ player: chanceux, icon: "😅", title: t("award_lucky"), desc: `${bestRound.score} ${t("award_round_desc")}` });
    }

    // 8. 🔥 Le régulier → smallest score variance
    const variance = {};
    players.forEach(p => {
      const scores = rounds.map(r => r.scores?.[p.id] || 0);
      const mean = scores.reduce((s,v)=>s+v,0)/Math.max(scores.length,1);
      variance[p.id] = scores.reduce((s,v) => s + Math.pow(v - mean, 2), 0) / Math.max(scores.length,1);
    });
    const regulierId = Object.entries(variance).sort((a,b) => a[1]-b[1])[0]?.[0];
    const regulier = players.find(p => p.id === regulierId);
    if (regulier && players.length > 1) {
      awards.push({ player: regulier, icon: "🔥", title: t("award_regular"), desc: t("award_regular_desc") });
    }

    // Deduplicate players in awards (1 award per player max, prioritize)
    const seen = new Set();
    return awards.filter(a => {
      if (seen.has(a.player.id)) return false;
      seen.add(a.player.id);
      return true;
    });
  }

  const awards = useMemo(() => computeAwards(), [rounds, players, myId, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Classements spéciaux ───────────────────────────────────
  const rankingFastest = useMemo(() => [...players]
    .filter(p => !p.eliminated)
    .map(p => {
      // Plus rapide = celui qui a appelé STOP (le plus de réponses uniques = proxy)
      const uniqueCount = (rounds || []).reduce((sum, r) => {
        return sum + Object.entries(r.validity || {}).filter(([, cv]) => cv?.[p.id] === 2).length;
      }, 0);
      return { ...p, uniqueCount };
    })
    .sort((a, b) => b.uniqueCount - a.uniqueCount), [players, rounds]);

  const rankingInventif = useMemo(() => [...players]
    .filter(p => !p.eliminated)
    .map(p => {
      // Plus inventif = mots les plus longs en moyenne
      const answers = (rounds || []).flatMap(r =>
        Object.values(r.answers || {}).map(ca => ca?.[p.id] || "")
      ).filter(a => a.trim());
      const avgLen = answers.length ? answers.reduce((s, a) => s + a.length, 0) / answers.length : 0;
      return { ...p, avgLen: Math.round(avgLen * 10) / 10 };
    })
    .sort((a, b) => b.avgLen - a.avgLen), [players, rounds]);

  const rankingScore = useMemo(() => [...players]
    .map(p => ({ ...p, score: gameState.cumulativeScores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score), [players, gameState.cumulativeScores]);

  const [activeTab, setActiveTab] = useState("scores");
  const podium = sorted.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <div className="hdr">
        <div className="logo">{iWon ? "🏆 Victoire !" : t("round_history")}</div>
        <span style={{ fontSize: 12, color: "var(--txm)" }}>{totalRounds} rounds</span>
      </div>
      <div className="cnt">

        {/* ── Win/Loss banner ── */}
        {iWon ? (
          <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>{t("congrats2")}</div>
            <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 4 }}>
              {myScore} pts · +{calcXpGain(myScore, true, totalRounds)} {t("xp")}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "14px 0 8px" }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>💪</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{t("good_game")}</div>
            <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 3 }}>
              +{calcXpGain(myScore, false, totalRounds)} {t("xp_gained","XP gagnés")}
            </div>
          </div>
        )}

        {/* ── ONGLETS CLASSEMENTS ── */}
        <div style={{ display:"flex", gap:4, marginBottom:12, background:"var(--sf2)", borderRadius:"var(--rs)", padding:4 }}>
          {[["scores","🏆"],["fastest","⚡"],["inventif","🎨"],["awards","🥇"]].map(([id, icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex:1, padding:"8px 4px", fontSize:12, fontWeight: activeTab===id?700:500,
              background: activeTab===id?"var(--sf)":"transparent",
              color: activeTab===id?"var(--ac)":"var(--txm)",
              border:"none", borderRadius:"var(--rs)", cursor:"pointer",
              boxShadow: activeTab===id?"var(--s1)":"none",
              transition:"all var(--tr)",
            }}>{icon}</button>
          ))}
        </div>

        {/* ── PODIUM (scores) ── */}
        {activeTab === "scores" && podium.length >= 2 && (
          <div className="card" style={{ padding: "20px 16px 16px" }}>
            <div className="ctitle" style={{ textAlign: "center" }}>{t("podium")}</div><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {/* 2nd place */}
              {podium[1] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{podium[1].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[1].name.split(" ")[0]}
                    {podium[1].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 70, background: "linear-gradient(180deg,#9ca3af,#6b7280)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                  }}>
                    <div style={{ fontSize: 20 }}>🥈</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{cumulativeScores[podium[1].id] || 0}pts</div>
                  </div>
                </div>
              )}
              {/* 1st place */}
              {podium[0] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{podium[0].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[0].name.split(" ")[0]}
                    {podium[0].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 96, background: "linear-gradient(180deg,#f59e0b,#d97706)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
                  }}>
                    <div style={{ fontSize: 26 }}>🥇</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{cumulativeScores[podium[0].id] || 0}pts</div>
                  </div>
                </div>
              )}
              {/* 3rd place */}
              {podium[2] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{podium[2].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[2].name.split(" ")[0]}
                    {podium[2].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 52, background: "linear-gradient(180deg,#b45309,#92400e)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                  }}>
                    <div style={{ fontSize: 16 }}>🥉</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1 }}>{cumulativeScores[podium[2].id] || 0}pts</div>
                  </div>
                </div>
              )}
            </div>
            {/* Base line */}
            <div style={{ height: 3, background: "var(--sf3)", borderRadius: 3 }} />
          </div>
        )}

        {/* ── TROPHÉES INDIVIDUELS ── */}
        {awards.length > 0 && (
          <div className="card">
            <div className="ctitle">{t("trophies2")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {awards.map((a, i) => {
                const isMe = a.player.id === myId;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: isMe ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${isMe ? "rgba(67,56,202,0.25)" : "var(--br)"}`,
                    borderRadius: "var(--rm)",
                    transition: "all var(--tr)",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, fontSize: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--sf)", border: "1.5px solid var(--br)",
                      flexShrink: 0,
                    }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isMe ? "var(--ac)" : "var(--tx)" }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 1 }}>{a.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--tx)" }}>
                        {a.player.isBot ? "🤖" : "👤"} {a.player.name.split(" ")[0]}
                      </div>
                      {isMe && <div style={{ fontSize: 10, color: "var(--ac)", fontWeight: 600 }}>{t("its_you")}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT SCORES ── */}
        {activeTab === "scores" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:10 }}>🏆 {t("leaderboard_title","Classement")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingScore.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)", border: p.id===myId?"1.5px solid var(--ac-border)":"1px solid var(--br)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:15, color:i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#cd7f32":"var(--txm)" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}{p.id===myId?` ${t("its_you_paren","(toi)")}`:""}  {p.eliminated?"💀":""}</div>
                  <div style={{ fontWeight:800, color:"var(--ac)", fontFamily:"monospace" }}>{p.score} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT RAPIDITÉ ── */}
        {activeTab === "fastest" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:6 }}>⚡ {t("award_fastest","Le plus rapide")}</div>
            <div style={{ fontSize:12, color:"var(--txm)", marginBottom:10 }}>{t("fastest_desc","Celui qui a trouvé le plus de réponses uniques")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingFastest.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:16, color:i===0?"#fbbf24":i===1?"#94a3b8":"var(--txm)" }}>{i===0?"⚡":i===1?"🔥":`#${i+1}`}</div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}</div>
                  <div style={{ fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>{p.uniqueCount} uniques</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT CRÉATIVITÉ ── */}
        {activeTab === "inventif" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:6 }}>🎨 {t("award_creative","Le plus inventif")}</div>
            <div style={{ fontSize:12, color:"var(--txm)", marginBottom:10 }}>{t("inventif_desc","Celui qui utilise les mots les plus longs et rares")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingInventif.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:16, color:i===0?"#fbbf24":i===1?"#94a3b8":"var(--txm)" }}>{i===0?"🎨":i===1?"✨":`#${i+1}`}</div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}</div>
                  <div style={{ fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>∅ {p.avgLen} lettres</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {activeTab === "awards" && awards.length > 0 && (
          <div className="card">
            <div className="ctitle">{t("trophies2")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {awards.map((a, i) => {
                const isMe = a.player.id === myId;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: isMe ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${isMe ? "rgba(67,56,202,0.25)" : "var(--br)"}`,
                    borderRadius: "var(--rm)",
                  }}>
                    <div style={{ width:44, height:44, borderRadius:12, fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--sf)", border:"1.5px solid var(--br)", flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color: isMe?"var(--ac)":"var(--tx)" }}>{a.title}</div>
                      <div style={{ fontSize:11, color:"var(--txm)", marginTop:1 }}>{a.desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{a.player.isBot?"🤖":"👤"} {a.player.name.split(" ")[0]}</div>
                      {isMe && <div style={{ fontSize:10, color:"var(--ac)", fontWeight:600 }}>{t("its_you")}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
        {/* ── Historique rounds ── */}
        <div className="card">
          <div className="ctitle">{t("round_history")}</div>
          {rounds.map((r, ri) => (
            <div key={ri} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 5 }}>
                Round {ri + 1} — <strong style={{ color: "var(--ac)" }}>{r.letter}</strong>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {players.map(p => (
                  <div key={p.id} style={{
                    fontSize: 12, background: p.id === myId ? "var(--acs)" : "var(--sf2)",
                    borderRadius: "var(--rs)", padding: "4px 9px",
                    border: `1px solid ${p.id === myId ? "rgba(67,56,202,0.2)" : "var(--br)"}`,
                  }}>
                    {p.name.split(" ")[0]} <span style={{ color: "var(--ac)", fontWeight: 700 }}>+{r.scores?.[p.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn bp mb8" style={{ marginBottom: 8 }} onClick={onPlayAgain}>{t("play_again2")}</button>
        <button className="btn bs" onClick={onHome}>{t("go_home2")}</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────
function OnboardingScreen({ onDone, lang }) {
  const t = useT(lang || "fr");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const nameInputRef = useRef(null);
  const steps = [
    { icon: "🎯", title: t("ob1_title"), desc: t("ob1_desc"), action: t("ob_next") },
    { icon: "🎰", title: t("ob2_title"), desc: t("ob2_desc"), action: t("ob_next") },
    { icon: "✍️", title: t("ob3_title"), desc: t("ob3_desc"), action: t("ob_next") },
    { icon: "🏆", title: t("ob4_title"), desc: t("ob4_desc"), action: t("ob_next") },
    { icon: "👤", title: t("ob5_title"), desc: t("ob5_desc"), action: t("ob_start"), input: true },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "var(--ac)" : "var(--br)", transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Card */}
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "bounce 0.5s ease" }}>{s.icon}</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 12, color: "var(--tx)" }}>{s.title}</div>
        <div style={{ fontSize: 15, color: "var(--txm)", lineHeight: 1.6, marginBottom: 32 }}>{s.desc}</div>

        {s.input && (
          <input
            ref={nameInputRef}
            className="inp"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("ob5_placeholder")}
            maxLength={20}
            style={{ marginBottom: 16, textAlign: "center", fontSize: 18, fontWeight: 600, border: name.trim() ? "1.5px solid var(--ac)" : "1.5px solid var(--rd)" }}
            autoFocus
          />
        )}

        <button
          className="btn bp"
          onClick={() => {
            if (isLast) {
              if (!name.trim()) {
                nameInputRef.current?.focus();
                return;
              }
              onDone(name.trim());
            } else {
              setStep(s => s + 1);
            }
          }}
          style={{ fontSize: 16, padding: "15px 32px" }}
        >
          {s.action}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: "none", color: "var(--txm)", marginTop: 14, cursor: "pointer", fontSize: 13 }}>{t("back_btn")}</button>
        )}
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────
function LeaderboardScreen({ onClose, xp, playerName, lang, uid }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("global");
  const [entries, setEntries] = useState([]);
  const [tournoiEntries, setTournoiEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const tournament = useMemo(() => getTournamentWeek(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const levelInfo = getLevelInfo(xp || 0, lang);
  const [, setTick] = useState(0);

  // Timer temps réel
  useEffect(() => {
    const id = setInterval(() => setTick(n => n+1), 1000);
    return () => clearInterval(id);
  }, []);

  // Charger classements Firebase (modular API)
  // Sauvegarder le profil dans le leaderboard uniquement si XP ou nom a changé (évite les écritures inutiles)
  const leaderboardWrittenRef = useRef({ xp: -1, name: "" });
  useEffect(() => {
    if (!uid || !FB.db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(getMockLeaderboard(uid, playerName, xp, levelInfo));
      setTournoiEntries([]);
      setLoading(false);
      return;
    }
    // N'écrire que si les valeurs ont changé depuis la dernière ouverture
    const didChange = leaderboardWrittenRef.current.xp !== (xp || 0) ||
                      leaderboardWrittenRef.current.name !== sanitizeName(playerName);
    if (didChange) {
      leaderboardWrittenRef.current = { xp: xp || 0, name: sanitizeName(playerName) };
      try {
        dbSet(dbRef(FB.db, "leaderboard/" + uid), {
          name: sanitizeName(playerName),
          xp: xp || 0,
          badge: levelInfo.badge,
          country: "🌍",
          updatedAt: Date.now(),
        });
      } catch { /* ignore */ }
    }

    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        // Classement global
        const snap = await dbGet(dbQuery(dbRef(FB.db, "leaderboard"), orderByChild("xp"), limitToLast(50)));
        const data = snap.val() || {};
        const list = Object.entries(data)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.xp - a.xp);
        if (isMounted) setEntries(list);
        // Classement tournoi de la semaine
        const weekKey = "week_" + tournament.weekNum;
        const tSnap = await dbGet(dbQuery(dbRef(FB.db, "tournoi/" + weekKey), orderByChild("score"), limitToLast(50)));
        const tData = tSnap.val() || {};
        const tList = Object.entries(tData)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.score - a.score);
        if (isMounted) setTournoiEntries(tList);
      } catch {
        if (isMounted) setEntries(getMockLeaderboard(uid, playerName, xp, levelInfo));
        if (isMounted) setTournoiEntries([]);
      }
      if (isMounted) setLoading(false);
    };
    loadData();

    // Listener temps réel pour le tournoi (modular API)
    let tournoiUnsub = null;
    try {
      const weekKey = "week_" + tournament.weekNum;
      tournoiUnsub = dbOnValue(dbQuery(dbRef(FB.db, "tournoi/" + weekKey), orderByChild("score"), limitToLast(50)), snap => {
        if (!isMounted) return;
        const data = snap.val() || {};
        const list = Object.entries(data)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.score - a.score);
        setTournoiEntries(list);
      });
    } catch { /* ignore */ }
    return () => { isMounted = false; if (tournoiUnsub) tournoiUnsub(); };
  }, [uid, xp, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const myRank = entries.findIndex(e => e.isMe) + 1;
  const myTournoiRank = tournoiEntries.findIndex(e => e.isMe) + 1;

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,var(--ac),var(--acl))", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>🏆 {t("nav_rank")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("leaderboard_title","Classement")}</div>
          {myRank > 0 && tab === "global" && (
            <div style={{ fontSize:13, opacity:.85, marginTop:4 }}>{t("leaderboard_my_rank","Ta position : #{rank} • {xp} XP").replace("{rank}", myRank).replace("{xp}", (xp||0).toLocaleString())}</div>
          )}
          {myTournoiRank > 0 && tab === "tournoi" && (
            <div style={{ fontSize:13, opacity:.85, marginTop:4 }}>{t("leaderboard_my_rank_tournoi","Ta position tournoi : #{rank}").replace("{rank}", myTournoiRank)}</div>
          )}
        </div>

        {/* Onglets */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--br)", background:"var(--sf)" }}>
          {[["global", t("tab_mondial","🌍 Mondial")],["tournoi", t("tab_tournoi","🏆 Tournoi")]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"12px 8px", fontSize:13, fontWeight: tab===id?700:500,
              color: tab===id?"var(--ac)":"var(--txm)",
              borderBottom: tab===id?"2px solid var(--ac)":"2px solid transparent",
              background:"none", border:"none", cursor:"pointer",
            }}>{label}</button>
          ))}
        </div>

        <div className="profile-body">

          {/* Tournoi de la semaine */}
          {tab === "tournoi" && (
            <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.06))", border:"1px solid rgba(99,102,241,.2)", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800 }}>🏆 Lettre : {tournament.letter}</div>
                  <div style={{ fontSize:11, color:"var(--txm)", marginTop:2 }}>
                    {tournament.daysLeft > 0 ? `${tournament.daysLeft} jours restants` : `${String(tournament.hoursLeft).padStart(2,"0")}h${String(tournament.minsLeft).padStart(2,"0")}m`}
                  </div>
                  <div style={{ fontSize:11, color:"var(--ac)", fontWeight:700, marginTop:4 }}>🎁 Gagnant = 1 mois VIP offert !</div>
                </div>
                <div style={{ fontSize:42, fontWeight:900, fontFamily:"monospace", color:"var(--ac)", opacity:.4 }}>{tournament.letter}</div>
              </div>
            </div>
          )}

          {/* Liste classement */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:"var(--txm)" }}>⏳ Chargement...</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {(tab === "global" ? entries : tournoiEntries).map((entry, i) => (
                <div key={entry.id || i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px", borderRadius:"var(--r)",
                  background: entry.isMe ? "var(--acs)" : i < 3 ? "var(--sf2)" : "var(--sf)",
                  border: entry.isMe ? "1.5px solid var(--ac)" : "1px solid var(--br)",
                }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:14,
                    color: i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#cd7f32":"var(--txm)" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{ fontSize:20 }}>{entry.badge || "⭐"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight: entry.isMe?700:500, color:"var(--tx)" }}>
                      {entry.name}{entry.isMe ? " (toi)" : ""}
                    </div>
                    <div style={{ fontSize:11, color:"var(--txm)" }}>{entry.country || "🌍"}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>
                    {tab === "global" ? `${(entry.xp||0).toLocaleString()} XP` : `${entry.score||0} pts`}
                  </div>
                </div>
              ))}
              {(tab === "global" ? entries : tournoiEntries).length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 0", color:"var(--txm)" }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🏆</div>
                  <div>{tab === "tournoi" ? t("no_tournoi_players","Sois le premier à jouer ce tournoi !") : t("no_global_players","Aucun joueur encore")}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding:"12px 16px", borderTop:"1px solid var(--br)" }}>
          <button className="btn bs" onClick={onClose}>{t("close","Fermer")}</button>
        </div>
      </div>
    </div>
  );
}

function getMockLeaderboard(uid, playerName, xp, levelInfo) {
  const mock = [
    { name:"Sophie L.", xp:8420, country:"🇫🇷", badge:"🔥", id:"m1" },
    { name:"Karim B.",  xp:7650, country:"🇲🇦", badge:"👑", id:"m2" },
    { name:"Lucas M.",  xp:6890, country:"🇧🇪", badge:"💎", id:"m3" },
    { name:"Marie D.",  xp:5920, country:"🇫🇷", badge:"⭐", id:"m4" },
    { name:"Amara S.",  xp:5100, country:"🇨🇮", badge:"🏆", id:"m5" },
    { name:"Thomas R.", xp:4380, country:"🇨🇭", badge:"🏅", id:"m6" },
    { name:"Lina K.",   xp:3750, country:"🇩🇿", badge:"🎓", id:"m7" },
    { name:"Julien F.", xp:2900, country:"🇫🇷", badge:"✏️", id:"m8" },
  ];
  const player = { name: playerName||"Toi", xp: xp||0, country:"🌍", badge: levelInfo.badge, id: uid||"me", isMe:true };
  return [...mock, player].sort((a,b) => b.xp - a.xp);
}

function ThemesScreen({
  current, onSelect, onClose, tier, onTier, lang
}) {
  const t = useT(lang || "fr");
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#4338ca)", padding: "24px 20px 20px", borderRadius: "24px 24px 0 0", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t("preferences")}</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{t("themes_title")}</div>
        </div>
        <div className="profile-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {THEMES.map(thm => {
              const locked = !thm.free && !canPro;
              const active = thm.id === current;
              return (
                <div key={thm.id} onClick={() => locked ? onTier() : onSelect(thm.id)} style={{
                  borderRadius: "var(--rm)", overflow: "hidden", cursor: "pointer",
                  border: active ? "2.5px solid var(--ac)" : "1.5px solid var(--br)",
                  boxShadow: active ? "0 0 0 3px var(--acg)" : "var(--s1)",
                  transition: "all 0.15s", opacity: locked ? 0.7 : 1,
                }}>
                  {/* Color preview */}
                  <div style={{ display: "flex", height: 44 }}>
                    {thm.preview.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                  </div>
                  <div style={{ padding: "6px 8px", background: thm.preview[0], display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: thm.preview[2] }}>{thm.name}</span>
                    {locked && <span style={{ fontSize: 9, background: "rgba(0,0,0,0.1)", padding: "1px 5px", borderRadius: 10, color: thm.preview[2] }}>{t("pro_label")}</span>}
                    {active && <span style={{ fontSize: 10 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {!canPro && (
            <div style={{ padding: "12px 14px", background: "var(--vipg)", borderRadius: "var(--rm)", border: "1.5px solid rgba(146,64,14,0.2)", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--vip)", marginBottom: 3 }}>{t("pro_themes_label")}</div>
              <div style={{ fontSize: 11, color: "var(--txm)" }}>{t("pro_themes_desc")}</div>
            </div>
          )}
          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BADGE NOTIFICATION ───────────────────────────────────────────
function BadgeNotification({
  badges, lang
}) {
  const t = useT(lang || "fr");
  return (
    <div style={{
      position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
      zIndex: 500, display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
    }}>
      {badges.map(b => (
        <div key={b.id} style={{
          background: "linear-gradient(135deg, #4338ca, #7c3aed)",
          color: "#fff", borderRadius: 50, padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 6px 20px rgba(67,56,202,0.35)",
          animation: "slideDown 0.4s cubic-bezier(.34,1.2,.64,1)",
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 22 }}>{b.icon}</span>
          <div>
            <div style={{ fontSize: 10, opacity: .8, letterSpacing: 1 }}>{t("badge_unlocked")}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS PANEL ──────────────────────────────────────────────
function SettingsPanel({ settings, setSettings, theme, onThemeChange, lang, setLang, tier, onTier, onClose, onBugReport, onRateApp, onShare, onEditProfile, onShowLegal }) {
  const t = useT(lang || "fr");
  const THEME_DOTS = [
    { id: "light",   color: "#4338ca", bg: "#fafaf8", label: "📄 Papier" },
    { id: "dark",    color: "#818cf8", bg: "#0c0c10", label: "🌑 Minuit" },
    { id: "sakura",  color: "#e879a0", bg: "#fff0f6", label: "🌸 Sakura",     pro: true },
    { id: "noir",    color: "#facc15", bg: "#000000", label: "🖤 Noir",       pro: true },
    { id: "neon",    color: "#39ff14", bg: "#0d0d1a", label: "⚡ Néon",       pro: true },
    { id: "sand",    color: "#d97706", bg: "#fef3c7", label: "🏜️ Sahara",    pro: true },
    { id: "nord",    color: "#5e81ac", bg: "#ecf4f8", label: "🧊 Nordique",   pro: true },
    { id: "volcano", color: "#ff3d00", bg: "#1a0505", label: "🌋 Volcan",     pro: true },
  ];
  const canPro = tier === TIER.PRO || tier === TIER.VIP;

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1c1917,#292524)", padding: "22px 20px 18px", borderRadius: "24px 24px 0 0", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .65, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t("preferences")}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{t("settings_title2")}</div>
        </div>
        <div className="profile-body">

          {/* Theme selector */}
          <div style={{ marginBottom: 20 }}>
            <div className="profile-section-title">{t("settings_theme")}</div>
            <div className="theme-switcher" style={{ flexWrap: "wrap", gap: 8 }}>
              {THEME_DOTS.map(thm => {
                const locked = thm.pro && !canPro;
                return (
                  <div key={thm.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      className={`theme-dot ${theme === thm.id ? "active" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${thm.bg} 50%, ${thm.color} 50%)`, width: 36, height: 36, opacity: locked ? 0.4 : 1 }}
                      onClick={() => locked ? onTier() : onThemeChange(thm.id)}
                      title={thm.label + (locked ? " (PRO)" : "")}
                    />
                    <span style={{ fontSize: 9, color: "var(--txm)", fontWeight: 500 }}>
                      {thm.label}{locked ? " 🔒" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings toggles */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("sounds_label")}</div>
                <div className="settings-sub">{t("sounds_sub")}</div>
              </div>
              <button
                className={`toggle ${settings.soundEnabled !== false ? "on" : ""}`}
                onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
              >
                <div className="toggle-knob" />
              </button>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("country_label")}</div>
                <div className="settings-sub">{t("settings_country_desc")}</div>
              </div>
              <select
                className="inp"
                style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
                value={settings.country || "France"}
                onChange={e => setSettings(s => ({ ...s, country: e.target.value }))}
              >
                {["France","Belgique","Suisse","Canada","Maroc","Algérie","Tunisie","Sénégal","Côte d'Ivoire","Autre"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("pseudo_label")}</div>
                <div className="settings-sub">{t("pseudo_sub")}</div>
              </div>
              <input
                className="inp"
                style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
                value={settings.playerName || ""}
                onChange={e => setSettings(s => ({ ...s, playerName: e.target.value }))}
                maxLength={16}
              />
            </div>
          </div>

          {/* Subscription */}
          <div style={{ padding: "12px 14px", background: "var(--acs)", borderRadius: "var(--rm)", border: "1.5px solid var(--ac-border,rgba(67,56,202,0.2))", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t("subscription")}</div>
            <div style={{ fontSize: 12, color: "var(--txm)", marginBottom: 8 }}>
              {tier === TIER.VIP ? t("vip_all_features") : tier === TIER.PRO ? t("pro_advanced") : t("free_tier_status","◇ Gratuit — Version de base")}
            </div>
            <button className="btn bp bsm" onClick={onTier} style={{ width: "auto", fontSize: 12 }}>
              {tier === TIER.FREE ? t("upgrade_pro") : t("manage_sub")}
            </button>
          </div>

          {/* Language selector */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("settings_lang")}</div>
                <div className="settings-sub">{t("lang_selector_sub")}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["fr","🇫🇷"],["en","🇬🇧"]].map(([l, flag]) => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    width: 38, height: 34, borderRadius: "var(--rs)",
                    border: `2px solid ${lang===l?"var(--ac)":"var(--br)"}`,
                    background: lang===l?"var(--acs)":"var(--sf)",
                    cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center",
                    justifyContent: "center",
                  }}>{flag}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Haptic feedback toggle */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("vibrations")}</div>
                <div className="settings-sub">{t("vibrations_sub")}</div>
              </div>
              <button
                className={`toggle ${settings.hapticEnabled !== false ? "on" : ""}`}
                onClick={() => {
                  const newVal = settings.hapticEnabled === false ? true : false;
                  setSettings(s => ({ ...s, hapticEnabled: newVal }));
                  Haptics.enabled = newVal;
                }}
              >
                <div className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Profile photo */}
          <button className="btn bs mb8" style={{ marginBottom: 8 }} onClick={onEditProfile}>
            {t("edit_photo")}
          </button>

          {/* Community */}
          <div className="ctitle" style={{ marginTop: 16 }}>{t("community")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onShare}>{t("share_game")}</button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onRateApp}>{t("rate_app")}</button>
          </div>
          <button className="btn bs mb8" style={{ marginBottom: 16 }} onClick={onBugReport}>{t("bug_title")}</button>

          {/* Legal */}
          <div className="ctitle">{t("legal")}</div>
          <div className="card" style={{ padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{t("legal_title")}</div>
              <div>{t("legal_version")}</div>
              <div>{t("all_rights")}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_licenses")}</span>
              </div>
              <div>{t("legal_react")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("personal_data")}</span>
              </div>
              <div>{t("data_policy")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_contact")}</span> {t("legal_contact_email")}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--br)" }}>
            <div style={{ fontSize: 11, color: "var(--txd)", marginBottom: 8, textAlign: "center" }}>
              Le Petit Bac v1.0.0
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => onShowLegal("cgu")} style={{ background: "none", border: "none", fontSize: 11, color: "var(--txm)", cursor: "pointer", textDecoration: "underline" }}>{t("cgu_title","CGU")}</button>
              <span style={{ color: "var(--txd)", fontSize: 11 }}>·</span>
              <button onClick={() => onShowLegal("privacy")} style={{ background: "none", border: "none", fontSize: 11, color: "var(--txm)", cursor: "pointer", textDecoration: "underline" }}>{t("privacy_title","Confidentialité")}</button>
            </div>
          </div>
          <button className="btn bs" style={{ marginTop: 12 }} onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BUG REPORT ──────────────────────────────────────────────────
function BugReportModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [category, setCategory] = useState("gameplay");
  const [desc, setDesc] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!desc.trim()) return;
    if (import.meta.env.DEV) console.log("Bug report:", { category, desc, timestamp: new Date().toISOString() });
    setSent(true);
    Haptics.success();
    setTimeout(onClose, 2000);
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#b91c1c,#dc2626)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("support")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("bug_title")}</div>
        </div>
        <div className="profile-body">
          {sent && (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{t("bug_thanks")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginTop:6 }}>{t("on_it")}</div>
            </div>
          )}
          {!sent && (
            <div>
              <div className="ctitle" style={{ marginBottom:10 }}>{t("bug_category")}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                {[["gameplay","🎮 Gameplay"],["ui","🖼 Interface"],["scoring","📊 Scores"],["crash","💥 Crash"],["other", t("bug_cat_other","❓ Autre")]].map(([id, label]) => (
                  <button key={id} onClick={() => setCategory(id)} style={{
                    padding:"7px 12px", borderRadius:20,
                    border: category===id ? "1.5px solid var(--ac)" : "1.5px solid var(--br)",
                    background: category===id ? "var(--acs)" : "var(--sf)",
                    color: category===id ? "var(--ac)" : "var(--txm)",
                    fontWeight: category===id ? 700 : 500,
                    fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  }}>{label}</button>
                ))}
              </div>
              <div className="ctitle" style={{ marginBottom:8 }}>{t("description")}</div>
              <textarea
                className="inp"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={t("bug_desc_placeholder")}
                style={{ minHeight:120, resize:"none", marginBottom:14, lineHeight:1.5 }}
              />
              <button className="btn bp" onClick={submit} style={{ background:"linear-gradient(135deg,#b91c1c,#dc2626)" }}>
                {t("bug_send")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── RATE APP MODAL ───────────────────────────────────────────────
function RateAppModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);

  function submit() {
    if (stars === 0) return;
    Haptics.success();
    setDone(true);
    // In production: redirect to App Store / Play Store
    if (stars >= 4) {
      setTimeout(() => {
        const storeUrl = /iPhone|iPad/.test(navigator.userAgent)
          ? "https://apps.apple.com/app/le-petit-bac"
          : "https://play.google.com/store/apps/details?id=com.petitbac.app";
        window.open(storeUrl, "_blank");
        onClose();
      }, 1500);
    } else {
      setTimeout(onClose, 2000);
    }
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("rate_opinion")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("rate_title")}</div>
        </div>
        <div className="profile-body" style={{ textAlign:"center" }}>
          {done ? (
            <div style={{ padding:"30px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🙏</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{t("rate_thanks")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginTop:6 }}>
                {stars >= 4 ? "..." : "..."}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{t("rate_question")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginBottom:24 }}>{t("rate_help")}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                    style={{ fontSize:40, background:"none", border:"none", cursor:"pointer", transition:"transform 0.15s",
                      transform:(hover||stars)>=s?"scale(1.2)":"scale(1)", filter:(hover||stars)>=s?"none":"grayscale(1)" }}>⭐</button>
                ))}
              </div>
              <div style={{ fontSize:13, color:"var(--txm)", marginBottom:20, minHeight:20 }}>
                {stars===1?"😔":stars===2?"😐":stars===3?"🙂":stars===4?"😊":stars===5?"🤩":""}
              </div>
              <button className="btn bp" onClick={submit} disabled={stars===0}
                style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)" }}>{t("rate_validate")}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────────
function ShareModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [copied, setCopied] = useState(false);
  const url = "https://petitbac.app";
  const text = t("share_invite") + " 🎯";

  async function handleShare() {
    const result = await shareApp();
    if (result === "copied") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    Haptics.success();
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#4338ca,#7c3aed)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("share_invite")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("share_title")}</div>
        </div>
        <div className="profile-body">
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
            <div style={{ fontSize:16, fontWeight:700 }}>{t("app_name_fr")}</div>
            <div style={{ fontSize:13, color:"var(--txm)", marginTop:4 }}>{text}</div>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <button className="btn bp" style={{ flex:1 }} onClick={handleShare}>
              {copied ? "✅ " + t("close") : "📤 " + t("share_game")}
            </button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[["📲","WhatsApp",`https://wa.me/?text=${encodeURIComponent(text+" "+url)}`],
              ["🐦","Twitter",`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`],
              ["📘","Facebook",`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`]
            ].map(([icon,name,link]) => (
              <a key={name} href={link} target="_blank" rel="noopener noreferrer"
                style={{ flex:1, padding:"10px 6px", background:"var(--sf2)", border:"1.5px solid var(--br)",
                  borderRadius:"var(--rm)", textAlign:"center", textDecoration:"none", color:"var(--tx)" }}
                onClick={() => Haptics.light()}>
                <div style={{ fontSize:22 }}>{icon}</div>
                <div style={{ fontSize:11, marginTop:3, fontWeight:600 }}>{name}</div>
              </a>
            ))}
          </div>
          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PHOTO MODAL ──────────────────────────────────────────
function ProfilePhotoModal({ onClose, onSave, currentPhoto, playerName, lang }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("avatar"); // avatar | emoji
  const [selectedEmoji, setSelectedEmoji] = useState(currentPhoto || "");
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const AVATARS = ["🎯","🏆","⭐","🔥","💎","👑","🦁","🐺","🦊","🐯","🦅","🚀","⚡","💫","🌟","🎭","🎨","🎸","🎮","🏅"];
  const COLORS = ["#4338ca","#dc2626","#16a34a","#d97706","#7c3aed","#0284c7","#be185d","#0f766e"];
  const [bgColor, setBgColor] = useState("#4338ca");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function save() {
    if (preview) { onSave({ type:"photo", data:preview }); }
    else if (selectedEmoji) { onSave({ type:"emoji", emoji:selectedEmoji, bg:bgColor }); }
    else { onSave(null); }
    Haptics.success();
    onClose();
  }

  const initials = (playerName || "J").charAt(0).toUpperCase();

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#4338ca,#7c3aed)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("personalisation")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("photo_title")}</div>
        </div>
        <div className="profile-body">
          {/* Preview */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", overflow:"hidden", border:"3px solid var(--ac)",
              background:preview?"transparent":bgColor, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: selectedEmoji ? 36 : 32, fontWeight:800, color:"#fff" }}>
              {preview ? <img src={preview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="preview"/> :
               selectedEmoji || initials}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {[["avatar","🎭 Avatar"],["photo","📷 Photo"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, padding:"9px", borderRadius:"var(--rm)",
                border:`1.5px solid ${tab===id?"var(--ac)":"var(--br)"}`,
                background:tab===id?"var(--acs)":"var(--sf)",
                color:tab===id?"var(--ac)":"var(--txm)",
                fontWeight:tab===id?700:500, fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}>{label}</button>
            ))}
          </div>

          {tab === "avatar" && (
            <>
              <div className="ctitle">{t("choose_emoji")}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                {AVATARS.map(e => (
                  <button key={e} onClick={() => { setSelectedEmoji(e); setPreview(null); }} style={{
                    width:44, height:44, borderRadius:12, fontSize:22, border:`2px solid ${selectedEmoji===e?"var(--ac)":"var(--br)"}`,
                    background:selectedEmoji===e?"var(--acs)":"var(--sf2)", cursor:"pointer",
                  }}>{e}</button>
                ))}
              </div>
              <div className="ctitle">{t("choose_color")}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setBgColor(c)} style={{
                    width:32, height:32, borderRadius:"50%", background:c, cursor:"pointer",
                    border:`3px solid ${bgColor===c?"var(--tx)":"transparent"}`,
                  }}/>
                ))}
              </div>
            </>
          )}

          {tab === "photo" && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              {/* Deux inputs séparés : l'un avec capture (caméra), l'autre sans (galerie) */}
              <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handleFile} style={{ display:"none" }} />
              <input ref={el => { if (el) el._galleryRef = true; }} id="pb-gallery-input" type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
              <button className="btn bp" onClick={() => fileRef.current?.click()} style={{ marginBottom:8 }}>{t("photo_title")}</button>
              <button className="btn bs" onClick={() => document.getElementById("pb-gallery-input")?.click()}>🖼 {t("legal_licenses","Galerie")}</button>
            </div>
          )}

          <button className="btn bp" onClick={save}>{t("save_btn")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────
// ─── LEGAL MODAL ─────────────────────────────────────────────────
function LegalModal({ onClose, lang, type }) {
  const t = useT(lang || "fr");
  const APP_NAME = "Le Petit Bac";
  const EMAIL = "support@petitbac.app";
  const DATE = "1er janvier 2025";

  const cgu = `
CONDITIONS GÉNÉRALES D'UTILISATION — ${APP_NAME}
Dernière mise à jour : ${DATE}

1. OBJET
Les présentes CGU régissent l'utilisation de l'application ${APP_NAME}, jeu de mots multijoueur disponible sur le web.

2. ACCÈS AU SERVICE
L'accès est gratuit dans sa version de base. Des fonctionnalités supplémentaires sont disponibles via abonnement PRO (4,99€/mois) ou VIP (14,99€/mois), résiliables à tout moment.

3. COMPTE UTILISATEUR
Aucune création de compte n'est requise. Un identifiant anonyme est généré automatiquement à la première utilisation.

4. RÈGLES D'UTILISATION
Il est interdit d'utiliser le service pour diffuser des contenus illicites, haineux ou offensants. Tout comportement abusif entraîne la suspension du service.

5. PROPRIÉTÉ INTELLECTUELLE
L'application, son code, ses graphismes et son contenu sont la propriété exclusive de ${APP_NAME}. Toute reproduction est interdite sans autorisation.

6. RESPONSABILITÉ
Le service est fourni "tel quel". Nous ne garantissons pas une disponibilité ininterrompue.

7. CONTACT
${EMAIL}
  `;

  const privacy = `
POLITIQUE DE CONFIDENTIALITÉ — ${APP_NAME}
Dernière mise à jour : ${DATE}

1. DONNÉES COLLECTÉES
• Identifiant anonyme généré localement (aucun email, aucun mot de passe)
• Pseudonyme choisi par l'utilisateur
• Score XP et statistiques de jeu
• Données de jeu (parties jouées, mots saisis)

2. UTILISATION DES DONNÉES
Les données sont utilisées uniquement pour :
• Afficher le classement mondial
• Sauvegarder la progression
• Améliorer l'expérience de jeu

3. STOCKAGE
Les données sont stockées sur Firebase (Google Cloud, Europe) et en local sur votre appareil.

4. PARTAGE
Aucune donnée n'est vendue à des tiers. Le classement public affiche uniquement le pseudonyme et le score XP.

5. VOS DROITS (RGPD)
Vous pouvez demander la suppression de vos données à tout moment en contactant : ${EMAIL}

6. COOKIES
L'application utilise le stockage local (localStorage) pour sauvegarder vos préférences. Aucun cookie publicitaire.

7. CONTACT DPO
${EMAIL}
  `;

  const content_text = type === "cgu" ? cgu : privacy;
  const title = type === "cgu" ? t("cgu_title","Conditions d'utilisation") : t("privacy_title","Politique de confidentialité");

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "var(--sf2)", padding: "20px 20px 16px", borderRadius: "24px 24px 0 0", borderBottom: "1px solid var(--br)" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--tx)" }}>{title}</div>
        </div>
        <div className="profile-body">
          <pre style={{
            fontSize: 12, lineHeight: 1.7, color: "var(--txm)",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            fontFamily: "inherit",
          }}>{content_text}</pre>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--br)" }}>
          <button className="btn bp" onClick={onClose}>{t("close","Fermer")}</button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, setScreen, setGameState, onLeaderboard, lang }) {
  const t = useT(lang || "fr");
  return (
    <nav className="bnav">
      <button className={`nb ${tab==="home"?"active":""}`} onClick={() => { setTab("home"); setScreen("home"); }}>
        <span className="ni">🏠</span>{t("nav_home")}
      </button>
      {/* Aller en setup solo — initialiser gameState avec mode="solo" sans spreader un état potentiellement null */}
      <button className={`nb ${tab==="play"?"active":""}`} onClick={() => {
        setTab("play");
        if (setGameState) setGameState({ mode: "solo" });
        setScreen("setup");
      }}>
        <span className="ni">🎮</span>{t("nav_play")}
      </button>
      <button className={`nb ${tab==="online"?"active":""}`} onClick={() => { setTab("online"); setScreen("online"); }}>
        <span className="ni">🌐</span>{t("nav_online")}
      </button>
      <button className={`nb ${tab==="rank"?"active":""}`} onClick={() => { setTab("rank"); onLeaderboard(); }}>
        <span className="ni">🏆</span>{t("nav_rank")}
      </button>
    </nav>
  );
}

// ─── TIER MODAL ───────────────────────────────────────────────────
function TierModal({
  current, uid, onSelect, onClose, lang
}) {
  const t = useT(lang || "fr");
  const [sel, setSel] = useState(current);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState("");

  const tiers = [
    {
      id: TIER.FREE, name: t("free_label","Gratuit"), price: "0€",
      cls: "tc-free", period: "",
      features: [t("tier_free_f1","6 catégories"), t("tier_free_f2","2 thèmes"), t("tier_free_f3","Solo vs IA")],
    },
    {
      id: TIER.PRO, name: "PRO ◆", price: "4,99€",
      cls: "tc-pro", period: t("per_month","/mois"),
      features: [t("tier_pro_f1","30 catégories"), t("tier_pro_f2","10 thèmes"), t("tier_pro_f3","Multijoueur illimité"), t("tier_pro_f4","Défi quotidien")],
    },
    {
      id: TIER.VIP, name: "VIP ★", price: "14,99€",
      cls: "tc-vip", period: t("per_month","/mois"),
      features: [t("tier_vip_f1","Tout PRO +"), t("tier_vip_f2","12 thèmes exclusifs"), t("tier_vip_f3","Tournois VIP"), t("tier_vip_f4","Badge exclusif ★")],
    },
  ];

  async function handleSelect(tier_item) {
    if (tier_item.id === TIER.FREE) {
      onSelect(TIER.FREE);
      onClose();
      return;
    }
    setLoading(true);
    setPayError("");
    // Paiement réel via Stripe Checkout (fonction serverless). En dev local sans
    // fonctions Netlify actives (ou si Stripe n'est pas configuré côté serveur),
    // on retombe en mode démo pour ne pas bloquer le développement.
    try {
      const resp = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          tier: tier_item.id,
          successUrl: window.location.origin + "/?checkout=success",
          cancelUrl: window.location.origin + "/?checkout=cancel",
        }),
      });
      if (!resp.ok) throw new Error("checkout indisponible");
      const data = await resp.json();
      if (!data.url) throw new Error("URL de paiement manquante");
      logEvent("subscription_click", { tier: tier_item.id });
      window.location.href = data.url; // redirection vers la vraie page Stripe Checkout
    } catch (e) {
      console.warn("[Stripe] Checkout indisponible, mode démo:", e.message);
      setPayError(t("stripe_test_mode","Mode démo : abonnement activé pour la présentation !"));
      onSelect(tier_item.id);
      setTimeout(() => onClose(), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, borderRadius: 20, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#4338ca)", padding: "20px 20px 16px", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>💎 {t("subscriptions","Abonnements")}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{t("tier_unlock","Débloquer l'accès complet")}</div>
        </div>

        {/* Tiers */}
        <div style={{ padding: "16px 16px 8px" }}>
          {tiers.map(tier_item => (
            <div
              key={tier_item.id}
              onClick={() => setSel(tier_item.id)}
              style={{
                marginBottom: 10, padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                border: sel === tier_item.id ? "2px solid var(--ac)" : "1.5px solid var(--br)",
                background: sel === tier_item.id ? "var(--acs)" : "var(--sf2)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 800,
                  color: tier_item.id === TIER.VIP ? "var(--vip)" : tier_item.id === TIER.PRO ? "var(--pro)" : "var(--tx)"
                }}>{tier_item.name}</div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ac)" }}>{tier_item.price}</span>
                  <span style={{ fontSize: 11, color: "var(--txm)" }}>{tier_item.period}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {tier_item.features.map((f, i) => (
                  <span key={i} style={{ fontSize: 11, background: "var(--sf3)", padding: "2px 8px", borderRadius: 99, color: "var(--txm)" }}>✓ {f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "0 16px 20px" }}>
          <button
            className={`btn ${sel === TIER.VIP ? "bvip" : sel === TIER.PRO ? "bpro" : "bp"} mb8`}
            style={{ marginBottom: 8 }}
            onClick={() => handleSelect(tiers.find(ti => ti.id === sel))}
            disabled={loading}
          >
            {loading ? "⏳ " + t("loading","Chargement...") :
             sel === current ? t("continue_btn","Continuer") :
             sel === TIER.FREE ? t("stay_free","Rester gratuit") :
             t("subscribe_btn","S'abonner") + " " + (sel === TIER.PRO ? "PRO" : "VIP")}
          </button>
          <button className="btn bs" onClick={onClose}>{t("cancel3","Annuler")}</button>
          {payError && (
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--yw)" }}>{payError}</div>
          )}
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "var(--txd)" }}>
            {t("stripe_secure","Paiement sécurisé par Stripe • Annulable à tout moment")}
          </div>
        </div>
      </div>
    </div>
  );
}
