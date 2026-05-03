// src/lib/firebase.ts
// Firebase is no longer used. Multiplayer is now handled via WebRTC.
// This file is kept to avoid import errors, but exports dummy objects.

const app = {} as any;
const db = {} as any;
const auth = {
  currentUser: null,
  onAuthStateChanged: (cb: any) => { return () => {}; },
  signOut: async () => {},
} as any;

export { app, db, auth };