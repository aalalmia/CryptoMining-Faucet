// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuqS4awtYYyC9nyDtmA99Lainu19Brqb8",
  authDomain: "cryptomining-faucet.firebaseapp.com",
  projectId: "cryptomining-faucet",
  storageBucket: "cryptomining-faucet.appspot.com",
  messagingSenderId: "197160555122",
  appId: "1:197160555122:web:1171e1db0a52172c6168eb",
  measurementId: "G-NF24EDNVJV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

window.db = database;
window.dbRef = ref;
window.dbSet = set;