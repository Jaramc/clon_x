import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzB9sLcg_u2dlZvz0RsvdGmFTPL2MnSeM",
  authDomain: "clon-x-tdea.firebaseapp.com",
  projectId: "clon-x-tdea",
  storageBucket: "clon-x-tdea.firebasestorage.app",
  messagingSenderId: "125597103315",
  appId: "1:125597103315:web:b8d938fbc7714744091026",
  measurementId: "G-WPE2P8CT5C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
