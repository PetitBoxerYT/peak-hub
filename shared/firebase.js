// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ton config Firebase
const firebaseConfig = {
    apiKey: "TA_CLE_API",
    authDomain: "peak-hub.firebaseapp.com",
    projectId: "peak-hub",
    storageBucket: "peak-hub.appspot.com",
    messagingSenderId: "xxxxxxx",
    appId: "xxxxxxx"
};

// Initialisation
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
