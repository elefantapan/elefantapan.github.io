const gridSize = 4;
const gridEl = document.getElementById("grid");
const countdownEl = document.getElementById("countdown");
const levelCounterEl = document.getElementById("levelCounter");
const timerDisplayEl = document.getElementById("timerDisplay");
const startScreenEl = document.getElementById("startScreen");
const leaderboardList = document.getElementById("leaderboardList");
const resultPopup = document.getElementById("resultPopup");

const countdownTimeInput = document.getElementById("countdownTime");
const countdownLabel = document.getElementById("countdownLabel");
const pathSpeedInput = document.getElementById("pathSpeed");
const speedLabel = document.getElementById("speedLabel");

let path = [],
  currentStep = 0,
  level = 1,
  isPlaying = false,
  isPaused = false;
const maxLevel = 10;
let levelStartTime = 0,
  totalStartTime = 0,
  totalElapsed = 0;

const settings = {
  countdownTime: 2,
  pathSpeed: 400,
};

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("pathPulseSettings") || "{}");
  Object.assign(settings, saved);
  countdownTimeInput.value = settings.countdownTime;
  countdownLabel.textContent = settings.countdownTime;
  pathSpeedInput.value = settings.pathSpeed;
  speedLabel.textContent = settings.pathSpeed;
}

function saveSettings() {
  localStorage.setItem("pathPulseSettings", JSON.stringify(settings));
}

countdownTimeInput.addEventListener("input", () => {
  settings.countdownTime = parseInt(countdownTimeInput.value);
  countdownLabel.textContent = settings.countdownTime;
  saveSettings();
});

pathSpeedInput.addEventListener("input", () => {
  settings.pathSpeed = parseInt(pathSpeedInput.value);
  speedLabel.textContent = settings.pathSpeed;
  saveSettings();
});

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");

  if (tabId === "leaderboardTab") displayLeaderboard();
}

function buildGrid() {
  gridEl.innerHTML = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.addEventListener("click", handleClick);
      gridEl.appendChild(tile);
    }
  }
  gridEl.style.display = "none";
  countdownEl.style.display = "none";
  levelCounterEl.style.display = "none";
  timerDisplayEl.style.display = "none";
}

function getTile(x, y) {
  return document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function generatePath(length) {
  const p = [[0, 0]];
  let x = 0,
    y = 0;
  while (p.length < length) {
    const options = [];
    if (x < gridSize - 1) options.push([x + 1, y]);
    if (y < gridSize - 1) options.push([x, y + 1]);
    if (x > 0) options.push([x - 1, y]);
    if (y > 0) options.push([x, y - 1]);
    const [nx, ny] = options[Math.floor(Math.random() * options.length)];
    if (!p.some(([px, py]) => px === nx && py === ny)) {
      p.push([nx, ny]);
      x = nx;
      y = ny;
    }
  }
  return p;
}

async function showHints(path) {
  for (const [x, y] of path) {
    const tile = getTile(x, y);
    tile.classList.add("pulse");
    await wait(settings.pathSpeed);
    tile.classList.remove("pulse");
    await wait(100);
  }
}

async function startLevel() {
  path = generatePath(3 + level);
  currentStep = 0;
  isPlaying = false;
  buildGrid();
  gridEl.style.display = "grid";
  countdownEl.style.display = "block";
  levelCounterEl.style.display = "block";
  timerDisplayEl.style.display = "block";

  levelCounterEl.textContent = `Level ${level} / ${maxLevel}`;
  countdownEl.textContent = `Get ready... (${settings.countdownTime}s)`;
  await wait(settings.countdownTime * 1000);
  countdownEl.textContent = "Memorize the path...";
  await showHints(path);

  countdownEl.textContent = "Your turn!";
  levelStartTime = Date.now();
  isPlaying = true;
  isPaused = false;
}

function handleClick(e) {
  if (!isPlaying || isPaused) return;

  const x = +e.currentTarget.dataset.x;
  const y = +e.currentTarget.dataset.y;
  const [px, py] = path[currentStep];

  if (x === px && y === py) {
    e.currentTarget.classList.add("correct");
    currentStep++;
    if (currentStep === path.length) {
      isPlaying = false;
      const timeTaken = Date.now() - levelStartTime;
      totalElapsed += timeTaken;

      if (level === maxLevel) {
        saveToLeaderboard(totalElapsed);
        showResultPopup(
          "🎉 You Win!",
          `Total Time: ${(totalElapsed / 1000).toFixed(2)} seconds`
        );
      } else {
        level++;
        setTimeout(startLevel, 1000);
      }
    }
  } else {
    e.currentTarget.classList.add("wrong");
    isPlaying = false;
    showResultPopup("💥 You Lost!", `You reached level ${level}`);
  }
}

function togglePause() {
  if (!isPlaying) return;
  isPaused = !isPaused;
  countdownEl.textContent = isPaused ? "Paused" : "Your turn!";
}

function startGame() {
  level = 1;
  totalElapsed = 0;
  startScreenEl.style.display = "none";
  closeResultPopup();
  startLevel();
}

function saveToLeaderboard(timeMs) {
  const leaderboard = JSON.parse(
    localStorage.getItem("pathPulseLeaderboard") || "[]"
  );
  leaderboard.push(timeMs);
  leaderboard.sort((a, b) => a - b);
  localStorage.setItem(
    "pathPulseLeaderboard",
    JSON.stringify(leaderboard.slice(0, 5))
  );
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(
    localStorage.getItem("pathPulseLeaderboard") || "[]"
  );
  leaderboardList.innerHTML =
    leaderboard.length === 0
      ? "<li>No times yet</li>"
      : leaderboard
          .map((t, i) => `<li>#${i + 1}: ${(t / 1000).toFixed(2)}s</li>`)
          .join("");
}

function resetLeaderboard() {
  localStorage.removeItem("pathPulseLeaderboard");
  displayLeaderboard();
  alert("Leaderboard reset!");
}

function hideGameUI() {
  gridEl.style.display = "none";
  countdownEl.style.display = "none";
  levelCounterEl.style.display = "none";
  timerDisplayEl.style.display = "none";
}

function showResultPopup(title, details) {
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultDetails").textContent = details;
  resultPopup.classList.remove("hidden");
}

function closeResultPopup() {
  resultPopup.classList.add("hidden");
}

// Init
loadSettings();
buildGrid();
