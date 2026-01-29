// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7VkgVoQjQ205Zu6fCIbzwc7b9jwZuMmA",
  authDomain: "zoefinan-bbe82.firebaseapp.com",
  projectId: "zoefinan-bbe82",
  storageBucket: "zoefinan-bbe82.firebasestorage.app",
  messagingSenderId: "434435894822",
  appId: "1:434435894822:web:d5e9da0b0473b6ee9f80e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);