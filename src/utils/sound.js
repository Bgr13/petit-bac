export const SoundFX = {
  ctx: null,
  getCtx() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
    return this.ctx;
  },
  play(type) {
    const ctx = this.getCtx(); if (!ctx) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === "tick") {
        o.frequency.setValueAtTime(800, now);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.start(now); o.stop(now + 0.05);
      } else if (type === "lock") {
        o.frequency.setValueAtTime(523, now);
        o.frequency.setValueAtTime(659, now + 0.1);
        o.frequency.setValueAtTime(784, now + 0.2);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        o.start(now); o.stop(now + 0.4);
      } else if (type === "valid") {
        o.frequency.setValueAtTime(440, now);
        o.frequency.setValueAtTime(660, now + 0.05);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.start(now); o.stop(now + 0.15);
      } else if (type === "invalid") {
        o.type = "sawtooth";
        o.frequency.setValueAtTime(200, now);
        o.frequency.setValueAtTime(150, now + 0.1);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.start(now); o.stop(now + 0.2);
      } else if (type === "stop") {
        [523,659,784,1047].forEach((f,i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.setValueAtTime(f, now + i*0.07);
          g2.gain.setValueAtTime(0.12, now + i*0.07);
          g2.gain.exponentialRampToValueAtTime(0.001, now + i*0.07 + 0.12);
          o2.start(now + i*0.07); o2.stop(now + i*0.07 + 0.15);
        });
        return;
      } else if (type === "win") {
        [523,659,784,1047,1319].forEach((f,i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.setValueAtTime(f, now + i*0.1);
          g2.gain.setValueAtTime(0.13, now + i*0.1);
          g2.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.18);
          o2.start(now + i*0.1); o2.stop(now + i*0.1 + 0.2);
        });
        return;
      } else if (type === "eliminate") {
        o.type = "sawtooth";
        o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(60, now + 0.5);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.start(now); o.stop(now + 0.5);
      }
    } catch(e) {}
  }
};

export const Haptics = {
  enabled: true,
  light()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(10); } catch(e){} },
  medium() { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(20); } catch(e){} },
  heavy()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([30,10,30]); } catch(e){} },
  success(){ if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([10,50,10]); } catch(e){} },
  error()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([50,30,50]); } catch(e){} },
};
