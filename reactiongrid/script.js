const tabs = document.querySelectorAll("nav button");
const tabSections = document.querySelectorAll(".tab");
const startBtn = document.getElementById("start-btn");
const countdownDisplay = document.getElementById("countdown");
const grid = document.getElementById("grid");
const popup = document.getElementById("popup");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const leaderboardList = document.getElementById("leaderboard-list");

let settings = {
  countdown: 3,
  tileCount: 20,
};

let correct = 0;
let wrong = 0;
let total = 0;
let startTime;
let currentTile = null;
let currentTimeout = null;
let gameActive = false;
let tiles = [];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabSections.forEach((section) => section.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

document.getElementById("countdown-setting").addEventListener("change", (e) => {
  settings.countdown = parseInt(e.target.value);
});

document
  .getElementById("tile-count-setting")
  .addEventListener("change", (e) => {
    settings.tileCount = parseInt(e.target.value);
  });

startBtn.addEventListener("click", () => {
  startCountdown();
});

function startCountdown() {
  startBtn.classList.add("hidden");
  popup.classList.add("hidden");
  grid.classList.add("hidden");
  progressContainer.classList.add("hidden");

  let count = settings.countdown;
  countdownDisplay.classList.remove("hidden");
  countdownDisplay.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(interval);
      countdownDisplay.classList.add("hidden");
      startGame();
    } else {
      countdownDisplay.textContent = count;
    }
  }, 1000);
}

function startGame() {
  grid.classList.remove("hidden");
  progressContainer.classList.remove("hidden");
  grid.innerHTML = "";
  correct = 0;
  wrong = 0;
  total = 0;
  currentTile = null;
  startTime = performance.now();
  gameActive = true;
  progressBar.style.width = "0%";

  tiles = [];

  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.addEventListener("click", () => handleTileClick(tile));
    grid.appendChild(tile);
    tiles.push(tile);
  }

  nextTile();
}

function nextTile() {
  if (!gameActive || total >= settings.tileCount) return;

  tiles.forEach((tile) => tile.classList.remove("active", "miss"));
  currentTile = tiles[Math.floor(Math.random() * tiles.length)];
  currentTile.classList.add("active");

  const startDelay = 2000;
  const endDelay = 500;
  const progress = total / settings.tileCount;
  const delay = startDelay - (startDelay - endDelay) * progress;

  currentTimeout = setTimeout(() => {
    if (!gameActive) return;

    // If the tile is still active, it means the player missed it
    if (currentTile && currentTile.classList.contains("active")) {
      wrong++;
    }

    currentTile.classList.remove("active");
    currentTile = null;
    total++;
    updateProgress();

    if (total < settings.tileCount) {
      nextTile();
    } else {
      endGame();
    }
  }, delay);
}

function handleTileClick(tile) {
  if (!gameActive || !currentTile) return;

  clearTimeout(currentTimeout); // Prevent jump ahead

  if (tile === currentTile && tile.classList.contains("active")) {
    correct++;
  } else {
    tile.classList.add("miss");
    wrong++;
  }

  currentTile.classList.remove("active");
  currentTile = null;
  total++;
  updateProgress();

  if (total < settings.tileCount) {
    nextTile();
  } else {
    endGame();
  }
}

function updateProgress() {
  const percent = (total / settings.tileCount) * 100;
  progressBar.style.width = `${percent}%`;
}

function endGame() {
  gameActive = false;
  const time = ((performance.now() - startTime) / 1000).toFixed(2);
  const accuracy = ((correct / settings.tileCount) * 100).toFixed(1);

  popup.classList.remove("hidden");
  popup.innerHTML = `
    <h3>Great Job!</h3>
    <p>Time: ${time}s</p>
    <p>Misses: ${wrong}</p>
    <p>Accuracy: ${accuracy}%</p>
  `;

  grid.classList.add("hidden");
  progressContainer.classList.add("hidden");
  countdownDisplay.classList.add("hidden");

  leaderboardList.innerHTML += `<li>${time}s | Misses: ${wrong} | Accuracy: ${accuracy}% | Tiles: ${settings.tileCount}</li>`;
  startBtn.classList.remove("hidden");
}
