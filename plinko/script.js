let totalPoints = 0;

const pointsDisplay = document.getElementById("points-display");
const board = document.getElementById("plinko-board");
const slotPoints = [200, 400, 500, 400, 200, 300, 600, 100];
const slots = [];

function createPegs() {
  const rows = 12;
  const pegSpacingX = 45;
  const pegSpacingY = 60;
  const boardWidth = board.clientWidth;
  const cols = Math.floor(boardWidth / pegSpacingX);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const offset = y % 2 === 0 ? 0 : pegSpacingX / 2;
      const peg = document.createElement("div");
      peg.classList.add("peg");
      peg.style.left = `${x * pegSpacingX + offset - 6}px`;
      peg.style.top = `${y * pegSpacingY}px`;
      board.appendChild(peg);
    }
  }
}

function createSlots() {
  const boardWidth = board.clientWidth;
  const slotCount = slotPoints.length;
  const slotWidth = boardWidth / slotCount;

  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement("div");
    slot.classList.add("slot");
    slot.style.width = `${slotWidth}px`;
    slot.style.left = `${i * slotWidth}px`;
    slot.innerText = slotPoints[i];
    board.appendChild(slot);
    slots.push(slot);
  }
}

function dropBall(delay = 0) {
  setTimeout(() => {
    const ball = document.createElement("div");
    ball.classList.add("ball");
    let x = board.clientWidth / 2;
    let y = 0;
    let direction = Math.random() < 0.5 ? -1 : 1;

    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    board.appendChild(ball);

    let interval = setInterval(() => {
      y += 20;
      x += direction * 15;
      ball.style.top = `${y}px`;
      ball.style.left = `${x}px`;

      if (Math.random() < 0.5) {
        direction *= -1;
      }

      if (y >= board.clientHeight - 50) {
        clearInterval(interval);

        const slotIndex = Math.floor(
          x / (board.clientWidth / slotPoints.length)
        );
        const clampedIndex = Math.max(
          0,
          Math.min(slotPoints.length - 1, slotIndex)
        );
        const score = slotPoints[clampedIndex];

        totalPoints += score;
        pointsDisplay.textContent = `Points: ${totalPoints}`;

        // Highlight the slot
        slots[clampedIndex].classList.add("active-slot");

        // Remove the highlight after a short time
        setTimeout(() => {
          slots[clampedIndex].classList.remove("active-slot");
        }, 800);

        // Fade out and remove the ball
        ball.style.opacity = "0";
        setTimeout(() => {
          ball.remove();
        }, 300);
      }
    }, 50);
  }, delay);
}

document.getElementById("drop-button").addEventListener("click", () => {
  const count = parseInt(document.getElementById("ball-count").value) || 1;
  document.getElementById("result").innerHTML = "";
  for (let i = 0; i < count; i++) {
    dropBall(i * 300);
  }
});

createPegs();
createSlots();
