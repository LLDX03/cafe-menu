fetch("http://localhost:3000/me", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      window.location.href = "login.html";
      return;
    }

    const user = data.user;

    document.getElementById("stripName").textContent =
      "Welcome back, " + user.username;

    document.getElementById("stripAvatar").textContent =
      user.username.charAt(0).toUpperCase();

    document.getElementById("stripPts").textContent =
      user.points + " pts";

    document.getElementById("birthday").textContent =
      new Date(user.birthday).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
      });

    // optional:
    console.log("User data:", user);
  };



const userId = 1; // or get from login/session

async function loadUser() {
    const res = await fetch(`/api/user/${userId}`);
    const user = await res.json();

    // NAME
    document.getElementById('cardName').textContent = user.name;

    // POINTS
    pts = user.points;
    updatePts();

    // BIRTHDAY
    document.getElementById("birthday").textContent =
        new Date(user.birthday).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
        });

    document.getElementById("tier").textContent = user.tier;
}
loadUser();

function updatePts() {
    document.getElementById('cardPts').textContent = pts;

    const pct = Math.min(Math.round((pts / 300) * 100), 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
}
updatePts();

function redeem(btn, cost, name) {
    if (pts < cost) { showToast('Not enough points!'); return; }
    pts -= cost;
    updatePts();
    btn.textContent = 'Redeemed!';
    btn.disabled = true;
    // add to history
    const list = document.getElementById('historyList');
    const item = document.createElement('div');
    item.className = 'history-item';
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    item.innerHTML = `<div class="history-icon redeem"><i class="ti ti-award"></i></div><div class="history-info"><div class="history-name">Redeemed — ${name}</div><div class="history-date">${today}</div></div><div class="history-pts redeem">−${cost} pts</div>`;
    list.prepend(item);
    showToast('☕ ' + name + ' redeemed! Show this at the counter.');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}