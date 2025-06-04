document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <input id="email" placeholder="Email" type="email" /><br>
      <input id="wallet" placeholder="Cwallet ID" type="text" /><br>
      <input id="password" placeholder="Password" type="password" /><br>
      <button onclick="login()">Login</button>
    </div>
  `;
});

function login() {
  const email = document.getElementById("email").value;
  const wallet = document.getElementById("wallet").value;
  const password = document.getElementById("password").value;

  if (!email || !wallet || !password) return alert("Please fill all fields");

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)) {
    return alert("Password must have upper, lower, number & symbol (8+ chars)");
  }

  const user = { email, wallet, password, joined: Date.now() };

  window.dbSet(window.dbRef(window.db, 'users/' + wallet), user)
    .then(() => alert("Login successful!"))
    .catch((e) => alert("Error saving to DB"));

  // Replace login screen with mining later
}