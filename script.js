let currentUser = null;
let adCloseCount = {};

// ENTRY
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("user")) {
    currentUser = JSON.parse(localStorage.getItem("user"));
    showMiningPage();
  } else {
    showLoginPage();
  }
});

// LOGIN PAGE
function showLoginPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container" id="login-page">
      <h2>Welcome to Crypto Faucet Mining</h2>
      <div class="login-ads">
        <div id="ad-login-1">[Login Ad 1]</div>
        <div id="ad-login-2">[Login Ad 2]</div>
      </div>
      <input id="email" placeholder="Email" type="email" />
      <input id="wallet" placeholder="Cwallet ID" type="text" />
      <input id="password" placeholder="Password (min 8 chars)" type="password" />
      <button onclick="login()">Let’s Start</button>
    </div>
  `;
  loadAdContent();
}

// LOGIN HANDLER (fixed redirect logic)
function login() {
  const email = document.getElementById("email").value;
  const wallet = document.getElementById("wallet").value;
  const password = document.getElementById("password").value;

  if (!email || !wallet || !password) return alert("Fill all fields");
  if (password.length < 8) return alert("Password must be at least 8 characters");

  currentUser = { email, wallet, password, joined: Date.now() };
  localStorage.setItem("user", JSON.stringify(currentUser));

  // Save to Firebase, but redirect immediately
  if (window.dbSet && window.dbRef && window.db) {
    window.dbSet(window.dbRef(window.db, 'users/' + wallet), currentUser);
  }

  showMiningPage();
}

// MAIN MINING PAGE
function showMiningPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container" id="mining-page">
      <div id="top-buttons">
        <button onclick="openLuckyAds()">Lucky Ads</button>
        <button onclick="openWallet('LuckyCash')">Lucky Cash</button>
        <button onclick="openWallet('Bwallet')">Bwallet</button>
      </div>
      <button onclick="openSpin()">Try Your Luck</button>

      <div id="miner-area"></div>

      <div id="mining-progress">
        <div id="mining-bar-fill"></div>
      </div>

      <div id="captcha"></div>
    </div>

    <!-- Lucky Ads Iframe -->
    <div id="claim-frame">
      <iframe src="https://example.com/ad.html"></iframe>
      <div id="claim-timer">15s</div>
    </div>

    <!-- Spin Popup -->
    <div id="spin-popup">
      <div id="spin-indicator"></div>
      <div id="spin-wheel"></div>
      <button onclick="spin()">Spin Now</button>
    </div>

    <!-- Wallet Popups -->
    <div id="wallet-popup" class="wallet-popup"></div>
  `;

  loadAdContent();
  startPopupAds();
  startMiningProgress();
}

// MINING PROGRESS
function startMiningProgress() {
  let fill = 0;
  const bar = document.getElementById("mining-bar-fill");

  const interval = setInterval(() => {
    fill += 1;
    bar.style.width = fill + "%";
    if (fill >= 100) {
      clearInterval(interval);
      showCaptcha();
    }
  }, 3000); // 5 min total
}

// CAPTCHA
function showCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  document.getElementById("captcha").innerHTML = `
    Solve: ${num1} + ${num2} =
    <input id="captcha-answer" type="number" />
    <button onclick="checkCaptcha(${num1 + num2})">Submit</button>
  `;
}

function checkCaptcha(correct) {
  const val = parseInt(document.getElementById("captcha-answer").value);
  if (val === correct) {
    showClaimFrame('Bwallet');
  } else {
    alert("Wrong answer");
  }
}

// CLAIM FRAME
function showClaimFrame(wallet) {
  document.getElementById("claim-frame").style.display = "block";
  let seconds = 15;
  const timer = document.getElementById("claim-timer");
  timer.innerText = seconds + "s";
  const interval = setInterval(() => {
    seconds--;
    timer.innerText = seconds + "s";
    if (seconds <= 0) {
      clearInterval(interval);
      timer.innerHTML = `<button onclick="claimReward('${wallet}')">Claim</button>`;
    }
  }, 1000);
}

function claimReward(wallet) {
  document.getElementById("claim-frame").style.display = "none";
  const ref = `wallets/${wallet}/${currentUser.wallet}`;
  window.dbSet(window.dbRef(window.db, ref), { earned: Date.now() });
  alert("Reward credited to " + wallet);
  showMiningPage();
}

// LUCKY ADS
function openLuckyAds() {
  showClaimFrame('LuckyCash');
}

// SPIN SYSTEM
function openSpin() {
  document.getElementById("spin-popup").style.display = "block";
}

function spin() {
  const rewards = ["0.01$", "0.05$", "0.1$", "0.3$", "0.5$", "1$", "3$", "Try Again"];
  const result = rewards[Math.floor(Math.random() * rewards.length)];
  alert("You got: " + result);
  document.getElementById("spin-popup").style.display = "none";
}

// WALLETS
function openWallet(type) {
  const box = document.getElementById("wallet-popup");
  box.style.display = "block";
  box.innerHTML = `
    <h3>${type} Withdrawal</h3>
    <p>Cwallet ID: ${currentUser.wallet}</p>
    <input id="amount" type="text" placeholder="Amount" />
    <button onclick="submitWithdraw('${type}')">Withdraw</button>
    <button onclick="box.style.display='none'">Close</button>
  `;
}

function submitWithdraw(type) {
  const amount = document.getElementById("amount").value;
  const ref = `withdrawals/${type}/${currentUser.wallet}`;
  window.dbSet(window.dbRef(window.db, ref), { amount, requested: Date.now() });
  alert("Withdrawal requested");
  document.getElementById("wallet-popup").style.display = "none";
}

// POSTER POPUP ADS
function startPopupAds() {
  const sides = ["top", "bottom", "left", "right"];
  sides.forEach(side => {
    const el = document.getElementById("popup-" + side);
    setTimeout(() => {
      el.style.display = "block";
      setTimeout(() => el.querySelector(".close-btn").style.display = "block", 10000);
    }, 1000);
  });
}

function closePopupAd(side) {
  const el = document.getElementById("popup-" + side);
  el.style.display = "none";

  if (!adCloseCount[side]) {
    adCloseCount[side] = 1;
    setTimeout(() => {
      el.style.display = "block";
      setTimeout(() => el.querySelector(".close-btn").style.display = "block", 10000);
    }, 10000);
  } else {
    adCloseCount[side] = 2;
  }
}

// LOAD AD CONTENT FROM FIREBASE
function loadAdContent() {
  ['top','bottom','left','right','login-1','login-2'].forEach(pos => {
    const path = "ads/" + pos;
    const adRef = window.dbRef(window.db, path);
    window.dbOn(adRef, snap => {
      const html = snap.val();
      const el = document.getElementById("popup-ad-" + pos) || document.getElementById("ad-" + pos.replace('login-', 'login-'));
      if (el && html) el.innerHTML = html;
    });
  });
}