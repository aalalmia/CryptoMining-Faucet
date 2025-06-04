// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuqS4awtYYyC9nyDtmA99Lainu19Brqb8",
  authDomain: "cryptomining-faucet.firebaseapp.com",
  projectId: "cryptomining-faucet",
  storageBucket: "cryptomining-faucet.appspot.com",
  messagingSenderId: "197160555122",
  appId: "1:197160555122:web:1171e1db0a52172c6168eb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.login = function () {
  const email = document.getElementById("email").value;
  const wallet = document.getElementById("wallet").value;
  const password = document.getElementById("password").value;

  if (!email || !wallet || !password) return alert("All fields required");
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
    return alert("Weak password: need upper, lower, digit, symbol, 8+ chars");
  }

  const user = { email, wallet, password, joined: Date.now() };
  set(ref(db, 'users/' + wallet), user)
    .then(() => {
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("main-page").style.display = "block";
      startAdPopups();
    })
    .catch(() => alert("Error saving data"));
};

window.startMining = function () {
  document.getElementById("mining-status").textContent = "Mining started...";
  setTimeout(() => {
    document.getElementById("mining-status").textContent = "You mined 10 coins!";
  }, 5000);
};

window.spinWheel = function () {
  const prizes = ["5 coins", "Try again", "10 coins", "Nothing", "20 coins"];
  const result = prizes[Math.floor(Math.random() * prizes.length)];
  document.getElementById("spin-result").textContent = `You got: ${result}`;
};

let adCooldown = 60;
window.claimLuckyAd = function () {
  const btn = document.getElementById("lucky-ad-btn");
  btn.disabled = true;
  let timeLeft = adCooldown;
  const timer = setInterval(() => {
    document.getElementById("lucky-timer").textContent = `Wait ${timeLeft}s`;
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timer);
      btn.disabled = false;
      document.getElementById("lucky-timer").textContent = "Ready to claim!";
    }
  }, 1000);
};

window.requestWithdraw = function (type) {
  const wallet = document.getElementById("wallet").value;
  const request = {
    wallet,
    type,
    time: Date.now(),
    status: "pending"
  };
  push(ref(db, "withdrawals"), request).then(() =>
    alert(`Requested ${type} withdrawal`)
  );
};

window.closeAd = function (pos) {
  document.getElementById("ad-" + pos).style.display = "none";
};

function startAdPopups() {
  ["top", "bottom", "left", "right"].forEach(pos => {
    const el = document.getElementById("ad-" + pos);
    setTimeout(() => {
      el.style.display = "block";
      setTimeout(() => {
        el.querySelector("button").disabled = false;
      }, 10000);
    }, 2000);
  });
}