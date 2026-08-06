import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref as dbRef, set as dbSet, get as dbGet, update as dbUpdate, onValue as dbOnValue, query as dbQuery, orderByChild, equalTo, limitToLast } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// ─── CONFIG ──────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const FIREBASE_READY = !!(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.apiKey !== "VOTRE_API_KEY" &&
  FIREBASE_CONFIG.apiKey !== "undefined"
);

const FB = (() => {
  let db = null;
  let auth = null;
  if (FIREBASE_READY) {
    try {
      const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
      db   = getDatabase(app);
      auth = getAuth(app);
    } catch (e) {
      console.warn("Firebase init failed, using local mode:", e);
    }
  }

  // ── Fallback local (même appareil) ──────────────────────────
  const local = { rooms: {}, listeners: {} };
  // uid stable quand l'auth Firebase échoue — généré une seule fois
  let localFallbackUid = null;

  return {
    db,  // Exposed for direct modular API usage (Leaderboard etc.)

    async signIn() {
      if (auth) {
        if (auth.currentUser) return { uid: auth.currentUser.uid };
        try {
          const result = await signInAnonymously(auth);
          return { uid: result.user.uid };
        } catch (e) {
          console.warn("[Firebase] Auth anonyme échouée:", e.code || e.message, "— mode local");
        }
      }
      if (!localFallbackUid) {
        // Persister dans localStorage pour garder la même identité après un rechargement
        // de page — sinon un joueur qui recharge en pleine partie change d'uid et ne peut
        // plus jamais reprendre sa place (l'ancienne entrée devient un fantôme orphelin).
        try {
          localFallbackUid = localStorage.getItem("pb_local_uid") || null;
        } catch { /* ignore */ }
        if (!localFallbackUid) {
          localFallbackUid = "local_" + Math.random().toString(36).substring(2, 9);
          try { localStorage.setItem("pb_local_uid", localFallbackUid); } catch { /* ignore */ }
        }
      }
      return { uid: localFallbackUid };
    },

    async createRoom(code, data) {
      if (db) {
        await dbSet(dbRef(db, "rooms/" + code), data);
        return code;
      }
      local.rooms[code] = JSON.parse(JSON.stringify(data));
      return code;
    },

    async getRoom(code) {
      if (db) {
        try {
          const snap = await dbGet(dbRef(db, "rooms/" + code));
          return snap.val();
        } catch (e) {
          if (e.code === "PERMISSION_DENIED") {
            throw new Error("Accès Firebase refusé. Configure les règles: rules > rooms > .read: true", { cause: e });
          }
          throw e;
        }
      }
      return local.rooms[code] ? JSON.parse(JSON.stringify(local.rooms[code])) : null;
    },

    async updateRoom(code, updates) {
      if (db) {
        await dbUpdate(dbRef(db, "rooms/" + code), updates);
        return;
      }
      if (!local.rooms[code]) return;
      local.rooms[code] = { ...local.rooms[code], ...updates };
      if (local.listeners[code]) local.listeners[code](JSON.parse(JSON.stringify(local.rooms[code])));
    },

    listenRoom(code, cb) {
      if (db) {
        const roomRef = dbRef(db, "rooms/" + code);
        const unsubscribe = dbOnValue(roomRef, snap => { if (snap.val()) cb(snap.val()); });
        return unsubscribe;
      }
      local.listeners[code] = cb;
      if (local.rooms[code]) cb(JSON.parse(JSON.stringify(local.rooms[code])));
      return () => { delete local.listeners[code]; };
    },

    async findPublicRoom(preferredCountry) {
      const isJoinable = (room) =>
        room.type === "public" &&
        room.status === "waiting" &&
        Object.keys(room.players || {}).length < 6;

      if (db) {
        const roomsRef = dbRef(db, "rooms");
        const waitingQuery = dbQuery(roomsRef, orderByChild("status"), equalTo("waiting"));
        const snap = await dbGet(waitingQuery);
        const rooms = Object.entries(snap.val() || {});
        // Prefer same-country rooms first, then fall back to any
        const sameCountry = rooms.find(([, r]) => isJoinable(r) && r.country === preferredCountry);
        if (sameCountry) return sameCountry[0];
        const any = rooms.find(([, r]) => isJoinable(r));
        return any ? any[0] : null;
      }
      const localRooms = Object.entries(local.rooms);
      const sameCountry = localRooms.find(([, r]) => isJoinable(r) && r.country === preferredCountry);
      if (sameCountry) return sameCountry[0];
      const any = localRooms.find(([, r]) => isJoinable(r));
      return any ? any[0] : null;
    },

    // ── FRIENDS ─────────────────────────────────────────────────
    async getFriendCode(uid) {
      // Try local storage first (works offline)
      let localCode = null;
      try { localCode = localStorage.getItem("pb_friendcode"); } catch { /* ignore */ }

      if (db) {
        try {
          const snap = await dbGet(dbRef(db, `users/${uid}/friendCode`));
          if (snap.val()) {
            // Ensure local is synced
            try { localStorage.setItem("pb_friendcode", snap.val()); } catch { /* ignore */ }
            return snap.val();
          }
        } catch { /* ignore */ }
        // Generate new code
        const code = "PB" + Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
          await dbSet(dbRef(db, `users/${uid}/friendCode`), code);
          await dbSet(dbRef(db, `friendCodes/${code}`), uid);
          try { localStorage.setItem("pb_friendcode", code); } catch { /* ignore */ }
        } catch (e) { console.warn("FB friendCode write failed:", e); }
        return code;
      }
      // Offline: generate and persist locally
      if (localCode) return localCode;
      const code = "PB" + Math.random().toString(36).substring(2, 8).toUpperCase();
      try { localStorage.setItem("pb_friendcode", code); } catch { /* ignore */ }
      return code;
    },

    async syncUserProfile(uid, name, xp) {
      if (!db || !uid) return;
      try {
        await dbUpdate(dbRef(db, `users/${uid}`), { name: name || "Joueur", xp: xp || 0, updatedAt: Date.now() });
      } catch { /* ignore */ }
    },

    async lookupByFriendCode(code) {
      if (!db) return null;
      try {
        const snap = await dbGet(dbRef(db, `friendCodes/${code}`));
        return snap.val(); // uid or null
      } catch { return null; }
    },

    async sendFriendRequest(fromUid, fromName, toUid) {
      if (!db) throw new Error("offline");
      await dbSet(dbRef(db, `friendRequests/${toUid}/${fromUid}`), {
        name: fromName || "Joueur", sentAt: Date.now()
      });
    },

    async acceptFriendRequest(myUid, fromUid) {
      if (!db) return;
      const [theirSnap, mySnap] = await Promise.all([
        dbGet(dbRef(db, `users/${fromUid}`)),
        dbGet(dbRef(db, `users/${myUid}`)),
      ]);
      const them = theirSnap.val() || {};
      const me = mySnap.val() || {};
      await Promise.all([
        dbSet(dbRef(db, `friends/${myUid}/${fromUid}`), { name: them.name || "Joueur", xp: them.xp || 0, addedAt: Date.now() }),
        dbSet(dbRef(db, `friends/${fromUid}/${myUid}`), { name: me.name || "Joueur", xp: me.xp || 0, addedAt: Date.now() }),
        dbSet(dbRef(db, `friendRequests/${myUid}/${fromUid}`), null),
      ]);
    },

    async rejectFriendRequest(myUid, fromUid) {
      if (!db) return;
      await dbSet(dbRef(db, `friendRequests/${myUid}/${fromUid}`), null);
    },

    listenFriendRequests(uid, cb) {
      if (!db) { cb({}); return () => {}; }
      try {
        const ref = dbRef(db, `friendRequests/${uid}`);
        const unsub = dbOnValue(ref, snap => cb(snap.val() || {}));
        return unsub;
      } catch { cb({}); return () => {}; }
    },

    listenFriends(uid, cb) {
      if (!db) { cb({}); return () => {}; }
      try {
        const ref = dbRef(db, `friends/${uid}`);
        const unsub = dbOnValue(ref, snap => cb(snap.val() || {}));
        return unsub;
      } catch { cb({}); return () => {}; }
    },

    // Tier PRO/VIP réel, écrit uniquement par le webhook Stripe côté serveur
    // (Admin SDK, contourne les règles) — jamais par le client (cf. rules).
    listenUserTier(uid, cb) {
      if (!db) return () => {};
      try {
        const ref = dbRef(db, `users/${uid}/tier`);
        return dbOnValue(ref, snap => cb(snap.val() || null));
      } catch { return () => {}; }
    },

    async removeFriend(myUid, friendUid) {
      if (!db) return;
      await Promise.all([
        dbSet(dbRef(db, `friends/${myUid}/${friendUid}`), null),
        dbSet(dbRef(db, `friends/${friendUid}/${myUid}`), null),
      ]);
    },
  };
})();

// ─── APP ─────────────────────────────────────────────────────────
// ─── ANALYTICS ──────────────────────────────────────────────────────
function logEvent(eventName, params) {
  try {
    if (import.meta.env.DEV) {
      console.log("[Analytics]", eventName, params);
    }
  } catch { /* ignore */ }
}


export { FB, FIREBASE_READY, logEvent };
