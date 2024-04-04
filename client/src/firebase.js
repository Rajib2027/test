// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "property-b7567.firebaseapp.com",
  projectId: "property-b7567",
  storageBucket: "property-b7567.appspot.com",
  messagingSenderId: "297383240035",
  appId: "1:297383240035:web:a23c82d9bee53b47667356", 
  measurementId: "G-PS53SGY0G5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
