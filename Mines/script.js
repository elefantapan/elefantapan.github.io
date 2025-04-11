let timerInterval;
let elapsedSeconds = 0;
let gameOver = false;

function flipCard(container) {
  if (gameOver || container.classList.contains("flipped")) return;

  container.classList.add("flipped");
  const isBomb = container
    .querySelector(".card-back")
    .classList.contains("bomb");

  const grid = document.getElementById("cardGrid");
  const totalCards = 16;
  const mineCount = parseInt(document.getElementById("mineCount").value);

  const safeClicks = Array.from(
    grid.querySelectorAll(".card-container")
  ).filter(
    (card) =>
      card.classList.contains("flipped") &&
      !card.querySelector(".card-back").classList.contains("bomb")
  );

  if (isBomb) {
    clearInterval(timerInterval);
    gameOver = true;
    showPopup(false, safeClicks.length, totalCards - mineCount, mineCount);
  } else if (safeClicks.length === totalCards - mineCount) {
    clearInterval(timerInterval);
    gameOver = true;
    showPopup(true, safeClicks.length, totalCards - mineCount, mineCount);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  document.getElementById("timerDisplay").textContent = "Time: 0s";
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    document.getElementById(
      "timerDisplay"
    ).textContent = `Time: ${elapsedSeconds}s`;
  }, 1000);
}

function generateGrid() {
  const grid = document.getElementById("cardGrid");
  grid.innerHTML = "";
  gameOver = false;

  const totalCards = 16;
  const mineCount = Math.min(
    Math.max(parseInt(document.getElementById("mineCount").value), 0),
    totalCards
  );

  const mineIndices = new Set();
  while (mineIndices.size < mineCount) {
    mineIndices.add(Math.floor(Math.random() * totalCards));
  }

  for (let i = 0; i < totalCards; i++) {
    const container = document.createElement("div");
    container.className = "card-container";
    container.onclick = () => flipCard(container);

    const card = document.createElement("div");
    card.className = "card";

    const front = document.createElement("div");
    front.className = "card-front";
    front.textContent = "?";

    const back = document.createElement("div");
    back.className = "card-back";
    if (mineIndices.has(i)) {
      back.classList.add("bomb");
      back.textContent = "💣";
    } else {
      back.textContent = "💎";
    }

    card.appendChild(front);
    card.appendChild(back);
    container.appendChild(card);
    grid.appendChild(container);
  }

  startTimer();
}

function showPopup(win, clickedCount, totalSafe, mineCount) {
  gameOver = true;

  const popup = document.getElementById("resultPopup");
  popup.classList.remove("hidden");

  document.getElementById("resultMessage").textContent = win
    ? "You Win!"
    : "You Lose";
  document.getElementById("clickedCount").textContent = clickedCount;
  document.getElementById("totalSafe").textContent = totalSafe;
  document.getElementById("mineCountStat").textContent = mineCount;
  document.getElementById("timeTaken").textContent = elapsedSeconds;
}

function playAgain() {
  document.getElementById("resultPopup").classList.add("hidden");
  generateGrid();
}

function closePopup() {
  document.getElementById("resultPopup").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", generateGrid);
