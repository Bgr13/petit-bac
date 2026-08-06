const Haptics = {
  enabled: true,
  light()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(10); } catch { /* ignore */ } },
  medium() { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(20); } catch { /* ignore */ } },
  heavy()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([30,10,30]); } catch { /* ignore */ } },
  success(){ if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([10,50,10]); } catch { /* ignore */ } },
  error()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([50,30,50]); } catch { /* ignore */ } },
};

// ─── UTILITAIRE PARTAGE ──────────────────────────────────────────
async function shareApp() {
  const shareData = {
    title: "Le Petit Bac",
    text: "Joue au Petit Bac avec moi ! Le meilleur jeu de mots sur mobile 🎯",
    url: "https://apps.apple.com/app/le-petit-bac",
  };
  try {
    if (navigator.share) { await navigator.share(shareData); return true; }
    else { await navigator.clipboard.writeText(shareData.url + " — " + shareData.text); return "copied"; }
  } catch { return false; }
}

// ─── UTILS ───────────────────────────────────────────────────────
/** Sanitize a user-visible name before writing to Firebase or displaying */
function sanitizeName(name) {
  if (!name || typeof name !== "string") return "Joueur";
  return name.trim().replace(/\s+/g, " ").slice(0, 20) || "Joueur";
}

// ─── FIREBASE (npm modular API — BUG 1 FIX) ──────────────────────

// ─── SOUND FX ─────────────────────────────────────────────────────────────
// Singleton AudioContext — évite la limite mobile (~6 contextes simultanés)
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === "closed") {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Résoudre la suspension auto sur iOS/Chrome (requiert un geste utilisateur au préalable)
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

const SoundFX = {
  play: (sound) => {
    try {
      if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") return;
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const sounds = {
        tick:  { freq: 800, dur: 0.05, type: "sine"    },
        lock:  { freq: 523, dur: 0.15, type: "triangle" },
        stop:  { freq: 392, dur: 0.3,  type: "square"  },
        win:   { freq: 659, dur: 0.4,  type: "sine"    },
        wrong: { freq: 200, dur: 0.2,  type: "sawtooth" },
        badge: { freq: 880, dur: 0.3,  type: "sine"    },
      };
      const s = sounds[sound] || sounds.tick;
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.dur);
    } catch { /* ignore */ }
  }
};


export { Haptics, sanitizeName, getAudioCtx, SoundFX };
