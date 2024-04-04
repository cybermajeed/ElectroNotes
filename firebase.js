import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCLfrQVLdX98J_Axa1PEQ9h4pLUFHb32g",
  authDomain: "electronotes-fbf7e.firebaseapp.com",
  projectId: "electronotes-fbf7e",
  storageBucket: "electronotes-fbf7e.appspot.com",
  messagingSenderId: "120507508085",
  appId: "1:120507508085:web:3845e1b009dc06bdea1f3c",
  measurementId: "G-42YHWSNCW4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
