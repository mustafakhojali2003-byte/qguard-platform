import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Same Firebase project as mustafaqa — data isolated under /tenants/{slug}/
const firebaseConfig = {
  apiKey: "AIzaSyAaAKtNlGzaAMbWnVJaSz6XytVrEE5mhHI",
  authDomain: "mustafa-app-c7174.firebaseapp.com",
  projectId: "mustafa-app-c7174",
  storageBucket: "mustafa-app-c7174.firebasestorage.app",
  messagingSenderId: "95257504490",
  appId: "1:95257504490:web:0d59629d2634f1828c8593",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
