
// src/lib/firebase.ts
// FIREBASE DISABLED TEMPORARILY
// This file now exports dummy objects to prevent initialization errors.

const app = {} as any;
const db = {} as any;
const auth = {
    currentUser: null,
    onAuthStateChanged: (cb: any) => { return () => {}; }, // Dummy unsubscribe
    signOut: async () => {},
} as any;

export { app, db, auth };
