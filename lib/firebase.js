import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDsVuC2jyvmaOb7em3cP7VzVNGmqsN6KSk",
  authDomain: "dportfolio-404bb.firebaseapp.com",
  projectId: "dportfolio-404bb",
  storageBucket: "dportfolio-404bb.firebasestorage.app",
  messagingSenderId: "209653810389",
  appId: "1:209653810389:web:81ee1afa869326f74a8e5c"
}

// Ensure single Firebase instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Firestore is safe everywhere
export const db = getFirestore(app)

// Auth is CLIENT ONLY — do NOT use in server components
export const auth = typeof window !== "undefined"
  ? getAuth(app)
  : null
