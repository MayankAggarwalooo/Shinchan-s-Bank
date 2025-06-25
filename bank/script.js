// Theme Toggle
const toggleDarkMode = document.getElementById('dark-mode-toggle');
if (toggleDarkMode) {
  toggleDarkMode.addEventListener("change", function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

// Show tabs
function showTab(tab, event) {
  document.querySelectorAll(".tab-section").forEach(t => t.classList.remove("active-section"));
  document.getElementById(tab).classList.add("active-section");
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");
}

// Load user dashboard info
window.onload = function () {
  const user = JSON.parse(localStorage.getItem("bankUser"));

  if (!user) {
    alert("⚠️ Please log in again.");
    window.location.href = "login.html";
    return;
  }

  const usernameEl = document.getElementById("username");
  const balanceEl = document.getElementById("balance");
  const cardUserEl = document.getElementById("card-user");
  const cardAccountEl = document.getElementById("card-account");
  const userPhotoEl = document.getElementById("user-photo");

  if (usernameEl) usernameEl.textContent = "Welcome, " + user.fullname;
  if (balanceEl) balanceEl.textContent = parseFloat(user.balance || 0).toFixed(2);
  if (cardUserEl) cardUserEl.textContent = user.fullname;
  if (cardAccountEl) {
    const acc = user.accountNo || "0000000000";
    cardAccountEl.textContent = acc.slice(-4).padStart(acc.length, "*");
  }

if (userPhotoEl) {
  const photo = localStorage.getItem(`photo_${user.email}`);
  userPhotoEl.src = photo || "avatar.png";
}

  showTransactions();
};

// Save user to both bankUser & users array
function saveUser(user) {
  localStorage.setItem("bankUser", JSON.stringify(user));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) users[index] = user;
  localStorage.setItem("users", JSON.stringify(users));
}

// Deposit
function deposit() {
  const amt = parseFloat(document.getElementById("deposit-amount").value);
  const desc = document.getElementById("deposit-desc").value || "Deposit";
  const user = JSON.parse(localStorage.getItem("bankUser"));

  if (amt > 0 && user) {
    user.balance += amt;
    user.transactions.push({
      type: "Deposit",
      desc,
      amt,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    saveUser(user);
    alert("Deposited ₹" + amt);
    location.reload();
  } else {
    alert("Enter a valid amount.");
  }
}

// Withdraw
function withdraw() {
  const amt = parseFloat(document.getElementById("withdraw-amount").value);
  const desc = document.getElementById("withdraw-desc").value || "Withdraw";
  const user = JSON.parse(localStorage.getItem("bankUser"));

  if (amt > 0 && user && amt <= user.balance) {
    user.balance -= amt;
    user.transactions.push({
      type: "Withdraw",
      desc,
      amt: -amt,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    saveUser(user);
    alert("Withdrawn ₹" + amt);
    location.reload();
  } else {
    alert("❌ Insufficient funds or invalid amount!");
  }
}

// Transfer
function transfer() {
  const amt = parseFloat(document.getElementById("transfer-amount").value);
  const desc = document.getElementById("transfer-desc").value || "Transfer";
  const user = JSON.parse(localStorage.getItem("bankUser"));

  if (amt > 0 && user && amt <= user.balance) {
    user.balance -= amt;
    user.transactions.push({
      type: "Transfer",
      desc,
      amt: -amt,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    saveUser(user);
    alert("Transferred ₹" + amt);
    location.reload();
  } else {
    alert("❌ Invalid or insufficient amount.");
  }
}

// Apply for loan
function applyLoan() {
  const amt = parseFloat(document.getElementById("loan-amount").value);
  const purpose = document.getElementById("loan-purpose").value || "Loan";
  const user = JSON.parse(localStorage.getItem("bankUser"));

  if (amt > 0 && user) {
    document.getElementById("loan-status").textContent = "✅ Loan application submitted.";
    user.transactions.push({
      type: "Loan Applied",
      desc: purpose,
      amt,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    saveUser(user);
  } else {
    alert("Enter a valid loan amount.");
  }
}

// Show transactions and draw chart
function showTransactions() {
  const user = JSON.parse(localStorage.getItem("bankUser"));
  const data = user?.transactions || [];
  const body = document.getElementById("history-body");
  if (!body) return;

  let income = 0, expense = 0;
  body.innerHTML = "";

  data.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.type}</td>
      <td>${tx.desc}</td>
      <td>${tx.date} ${tx.time}</td>
      <td class="${tx.amt >= 0 ? 'positive' : 'negative'}">₹${Math.abs(tx.amt)}</td>
    `;
    body.appendChild(tr);
    if (tx.amt >= 0) income += tx.amt;
    else expense += Math.abs(tx.amt);
  });

  const ctx = document.getElementById("chart")?.getContext("2d");
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['#28a745', '#dc3545']
        }]
      }
    });
  }
}

// Flip debit card
function flipCard(card) {
  card.querySelector(".card-inner").classList.toggle("flipped");
}

// Logout
function logout() {
  localStorage.removeItem("bankUser");
  window.location.href = "login.html";
}
