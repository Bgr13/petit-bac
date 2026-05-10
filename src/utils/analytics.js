// Simple analytics logger
// In production, replace with Firebase Analytics or similar
export function logEvent(eventName, params) {
  try {
    if (typeof window === "undefined") return;
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("[Analytics]", eventName, params);
    }
    // Future: integrate with Firebase Analytics
    // import { getAnalytics, logEvent as fbLogEvent } from "firebase/analytics";
  } catch(e) {}
}
