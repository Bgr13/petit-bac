// BUG 1 FIX: Use npm modular Firebase API instead of CDN-style
import { FIREBASE_CONFIG, FIREBASE_READY } from "../constants/firebase.js";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue, off, query, orderByChild, equalTo } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

let db = null;
let auth = null;

if (FIREBASE_READY) {
  try {
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
    db = getDatabase(app);
    auth = getAuth(app);
  } catch(e) {
    console.warn("Firebase init failed, using local mode:", e);
  }
}

// Fallback local (même appareil, même session)
const local = { rooms: {}, listeners: {} };

export const FB = {
  async signIn() {
    if (auth) {
      try {
        const result = await signInAnonymously(auth);
        return { uid: result.user.uid };
      } catch(e) {
        console.warn("signInAnonymously failed:", e);
      }
    }
    return { uid: "local_" + Math.random().toString(36).substring(2, 9) };
  },

  async createRoom(code, data) {
    if (db) {
      await set(ref(db, "rooms/" + code), data);
      return code;
    }
    local.rooms[code] = JSON.parse(JSON.stringify(data));
    return code;
  },

  async getRoom(code) {
    if (db) {
      const snap = await get(ref(db, "rooms/" + code));
      return snap.val();
    }
    return local.rooms[code] ? JSON.parse(JSON.stringify(local.rooms[code])) : null;
  },

  async updateRoom(code, updates) {
    if (db) {
      await update(ref(db, "rooms/" + code), updates);
      return;
    }
    if (!local.rooms[code]) return;
    local.rooms[code] = { ...local.rooms[code], ...updates };
    if (local.listeners[code]) local.listeners[code](JSON.parse(JSON.stringify(local.rooms[code])));
  },

  listenRoom(code, cb) {
    if (db) {
      const roomRef = ref(db, "rooms/" + code);
      const unsubscribe = onValue(roomRef, snap => { if (snap.val()) cb(snap.val()); });
      return unsubscribe;
    }
    local.listeners[code] = cb;
    if (local.rooms[code]) cb(JSON.parse(JSON.stringify(local.rooms[code])));
    return () => { delete local.listeners[code]; };
  },

  async findPublicRoom() {
    if (db) {
      const roomsRef = ref(db, "rooms");
      const waitingQuery = query(roomsRef, orderByChild("status"), equalTo("waiting"));
      const snap = await get(waitingQuery);
      const rooms = snap.val() || {};
      for (const [code, room] of Object.entries(rooms)) {
        if (room.type === "public" &&
            room.status === "waiting" &&
            Object.keys(room.players || {}).length < 6) {
          return code;
        }
      }
      return null;
    }
    for (const [code, room] of Object.entries(local.rooms)) {
      if (room.type === "public" && room.status === "waiting" &&
          Object.keys(room.players || {}).length < 6) {
        return code;
      }
    }
    return null;
  },
};
