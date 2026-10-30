const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const fpsEl = document.getElementById("fps");

// Game States
let gameState = "START"; // START, PLAYING, GAMEOVER
let score = 0;
let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = 0;

// Input tracking
const keys = {};

// Player Object (Physics enabled)
const player = {
    x: 100,
    y: 400,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpForce: -11,
    gravity: 0.5,
    grounded: false,
    color: "#00f3ff"
};

// Obstacles Array
let obstacles = [];
let obstacleTimer = 0;

// Event Listeners for Controls
window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
    score = 0;
    obstacles = [];
    obstacleTimer = 0;
    player.x = 100;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    
    scoreEl.innerText = score;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameState = "PLAYING";
}

function gameOver() {
    gameState = "GAMEOVER";
    finalScoreEl.innerText = Math.floor(score);
    gameOverScreen.classList.remove("hidden");
}

// Spawn new hazard blocks
function spawnObstacle() {
    const size = 30 + Math.random() * 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - 40 - size,
        width: size,
        height: size,
        speed: 4 + Math.random() * 3,
        color: "#ff0055"
    });
}

// Main Update Loop
function update() {
    if (gameState !== "PLAYING") return;

    // Player Movement (Left/Right)
    if (keys["ArrowLeft"] || keys["KeyA"]) {
        player.vx = -player.speed;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
        player.vx = player.speed;
    } else {
        player.vx *= 0.8; // Friction
    }

    // Jump
    if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
    }

    // Apply Gravity
    player.vy += player.gravity;

    // Update Player Position
    player.x += player.vx;
    player.y += player.vy;

    // Boundaries (Walls)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Floor Collision
    const floorY = canvas.height - 40;
    if (player.y + player.height >= floorY) {
        player.y = floorY - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // Obstacle Logic
    obstacleTimer++;
    if (obstacleTimer > 90) {
        spawnObstacle();
        obstacleTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= obs.speed;

        // Check AABB Collision with Player
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameOver();
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            scoreEl.innerText = score;
        }
    }
}

// Render Graphics
function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Floor
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f3ff";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.stroke();

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Obstacles
    for (let obs of obstacles) {
        ctx.fillStyle = obs.color;
        ctx.shadowColor = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    ctx.shadowBlur = 0; // Reset shadow for performance
}

// Game Loop / FPS Tracker
function gameLoop(currentTime) {
    // FPS Calculation
    frameCount++;
    if (currentTime - fpsTimer >= 1000) {
        fpsEl.innerText = frameCount;
        frameCount = 0;
        fpsTimer = currentTime;
    }

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Initialize Loop
requestAnimationFrame(gameLoop);
