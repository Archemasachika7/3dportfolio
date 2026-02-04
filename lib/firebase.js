import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsVuC2jyvmaOb7em3cP7VzVNGmqsN6KSk",
  authDomain: "dportfolio-404bb.firebaseapp.com",
  projectId: "dportfolio-404bb",
  storageBucket: "dportfolio-404bb.firebasestorage.app",
  messagingSenderId: "209653810389",
  appId: "1:209653810389:web:81ee1afa869326f74a8e5c"
}

// Prevent re-initialization (VERY important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const db = getFirestore(app)
export const auth = getAuth(app)
