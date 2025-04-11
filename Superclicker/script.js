let activeKeys = ["g", "h"];
let clicks = 0;
let gameRunning = false;
let duration = 5;
let startTime;
let resetPending = false;
let multiplayer = false;
let progressInterval;

// Multiplayer vars
let p1Score = 0;
let p2Score = 0;
let playerTurn = 1;
let multiplayerState = "waiting"; // waiting, ready, started
let spacePressed = false;
let keyPressedAfterSpace = false;

function showTab(id) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active-tab"));
  document.getElementById(id).classList.add("active-tab");
  if (id === "leaderboard") loadLeaderboard();
}

function toggleFilters() {
  const box = document.getElementById("filterBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function applyPreset() {
  const val = document.getElementById("keyPreset").value;
  const customBox = document.getElementById("customKeysContainer");
  if (val === "all") {
    activeKeys = Array.from("abcdefghijklmnopqrstuvwxyz");
    customBox.style.display = "none";
  } else if (val === "custom") {
    customBox.style.display = "block";
    updateCustomKeys();
  } else {
    activeKeys = val.split(",");
    customBox.style.display = "none";
  }
}

function updateCustomKeys() {
  const val = document.getElementById("customKeys").value;
  activeKeys = val
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length);
}

function startGame() {
  duration = parseInt(document.getElementById("testDuration").value) || 5;
  clicks = 0;
  gameRunning = true;
  resetPending = false;
  document.getElementById("scoreDisplay").innerText = "Go!";
  document.getElementById("progressBarContainer").style.display = "block";
  document.getElementById("progressBar").style.width = "0%";

  startTime = Date.now();

  progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = Math.min((elapsed / duration) * 100, 100);
    document.getElementById("progressBar").style.width = percent + "%";
  }, 50);

  setTimeout(() => {
    gameRunning = false;
    clearInterval(progressInterval);
    document.getElementById("progressBarContainer").style.display = "none";
    const cps = (clicks / duration).toFixed(2);
    document.getElementById(
      "scoreDisplay"
    ).innerText = `Score: ${clicks} | CPS: ${cps} (Press space to restart)`;
    saveScore(clicks, cps, activeKeys.join(","), duration);
    loadLeaderboard();
    resetPending = true;
  }, duration * 1000);
}

function saveScore(score, cps, keys, timeSec) {
  const scores = JSON.parse(localStorage.getItem("cpsScores") || "[]");
  scores.push({
    score,
    cps,
    keys,
    timeSec,
    time: new Date().toLocaleString(),
  });
  localStorage.setItem("cpsScores", JSON.stringify(scores));
}

function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("cpsScores") || "[]");
  const filterTime = document.getElementById("filterTime").value;
  const filterKeys = document
    .getElementById("filterKeys")
    .value.toLowerCase()
    .trim();

  const filtered = scores.filter((entry) => {
    const matchesTime = !filterTime || entry.timeSec == filterTime;
    const matchesKeys = !filterKeys || entry.keys.includes(filterKeys);
    return matchesTime && matchesKeys;
  });

  const list = document.getElementById("leaderboardList");
  list.innerHTML = "<h2>Leaderboard</h2>";
  filtered.sort((a, b) => b.score - a.score);
  filtered.slice(0, 10).forEach((entry) => {
    list.innerHTML += `
          <div class="leaderboard-entry">
            <strong>${entry.score}</strong> clicks | ${entry.cps} CPS<br>
            Keys: ${entry.keys} | Test: ${entry.timeSec}s | ${entry.time}
          </div>`;
  });
}

function handleKeyDown(e) {
  if (document.getElementById("game").classList.contains("active-tab")) {
    if (!gameRunning && !resetPending) {
      startGame();
    } else if (!gameRunning && resetPending && e.code === "Space") {
      resetPending = false;
      document.getElementById("scoreDisplay").innerText =
        "Press any key to start";
    } else if (gameRunning && activeKeys.includes(e.key.toLowerCase())) {
      clicks++;
      document.getElementById("scoreDisplay").innerText = `Clicks: ${clicks}`;
    }
  }

  if (document.getElementById("multiplayer").classList.contains("active-tab")) {
    if (!gameRunning) {
      if (!spacePressed && e.code === "Space") {
        spacePressed = true;
        document.getElementById("multiMessage").innerText =
          "Now press a valid key to begin!";
      } else if (spacePressed && activeKeys.includes(e.key.toLowerCase())) {
        startMultiplayerRound();
      }
    } else if (gameRunning && activeKeys.includes(e.key.toLowerCase())) {
      clicks++;
      document.getElementById(
        "multiMessage"
      ).innerText = `Player ${playerTurn}: Clicks ${clicks}`;
    }
  }
}

function startMultiplayerRound() {
  spacePressed = false;
  clicks = 0;
  gameRunning = true;

  duration = parseInt(document.getElementById("testDuration").value) || 5;
  document.getElementById("progressBarContainerMultiplayer").style.display =
    "block";
  document.getElementById("progressBarMultiplayer").style.width = "0%";
  document.getElementById(
    "multiMessage"
  ).innerText = `Player ${playerTurn}: Go!`;

  startTime = Date.now();

  progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = Math.min((elapsed / duration) * 100, 100);
    document.getElementById("progressBarMultiplayer").style.width =
      percent + "%";
  }, 50);

  setTimeout(() => {
    gameRunning = false;
    clearInterval(progressInterval);
    document.getElementById("progressBarContainerMultiplayer").style.display =
      "none";

    if (playerTurn === 1) {
      p1Score = clicks;
      playerTurn = 2;
      document.getElementById("multiMessage").innerText =
        "Player 2: Press space to begin";
    } else {
      p2Score = clicks;
      const result =
        p1Score > p2Score
          ? `🎉 Player 1 wins! ${p1Score} vs ${p2Score}`
          : p2Score > p1Score
          ? `🎉 Player 2 wins! ${p2Score} vs ${p1Score}`
          : `🤝 It's a tie! ${p1Score} - ${p2Score}`;
      document.getElementById(
        "multiMessage"
      ).innerText = `${result}\n(Press space to play again)`;
      playerTurn = 1;
    }
  }, duration * 1000);
}

document.addEventListener("keydown", handleKeyDown);
