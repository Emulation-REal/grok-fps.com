```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
let player = {
    x: 0,
    y: 0,
    z: 1.6, // Eye height
    angle: 0,
    health: 100,
    speed: 0.1,
    jumpVelocity: 0,
    isGrounded: true
};

let score = 0;
const moveSpeed = 0.1;
const gravity = 0.02;
const jumpPower = 0.3;

// Game objects
const obstacles = [
    { x: 5, y: 5, width: 2, height: 2 }, // Wall
    { x: -5, y: -5, width: 2, height: 2 }, // Wall
    { x: 0, y: 10, width: 3, height: 1 } // Cover
];

const platforms = [
    { x: -10, y: -10, z: 2, width: 4, height: 4 }, // Parkour platform
    { x: -8, y: -5, z: 3, width: 4, height: 4 },
    { x: -6, y: 0, z: 4, width: 4, height: 4 }
];

const enemies = [
    { x: 10, y: 10, z: 1, health: 50, speed: 0.05 },
    { x: -10, y: 10, z: 1, health: 50, speed: 0.05 }
];

// Images
const wallImg = new Image();
wallImg.src = 'assets/wall.png';
const platformImg = new Image();
platformImg.src = 'assets/platform.png';
const enemyImg = new Image();
enemyImg.src = 'assets/enemy.png';

// Controls
let keys = { w: false, s: false, a: false, d: false };
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyD') keys.d = true;
    if (e.code === 'Space' && player.isGrounded) {
        player.jumpVelocity = jumpPower;
        player.isGrounded = false;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyD') keys.d = false;
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

let mouseX = 0;
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        player.angle -= e.movementX * 0.002;
    }
});

// Shooting
canvas.addEventListener('click', () => {
    if (document.pointerLockElement === canvas) {
        const direction = { x: Math.sin(player.angle), y: Math.cos(player.angle) };
        enemies.forEach((enemy, index) => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 15) {
                const dot = dx * direction.x + dy * direction.y;
                if (dot > 0 && Math.acos(dot / dist) < 0.1) {
                    enemy.health -= 25;
                    if (enemy.health <= 0) {
                        enemies.splice(index, 1);
                        score += 10;
                        document.getElementById('score').textContent = `Score: ${score}`;
                    }
                }
            }
        });
    }
});

// Collision detection
function checkCollision(x, y, obstacles) {
    for (let obs of obstacles) {
        if (x + 0.5 > obs.x - obs.width / 2 &&
            x - 0.5 < obs.x + obs.width / 2 &&
            y + 0.5 > obs.y - obs.height / 2 &&
            y - 0.5 < obs.y + obs.height / 2) {
            return true;
        }
    }
    return false;
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // Player movement
    let newX = player.x;
    let newY = player.y;
    if (keys.w) {
        newX += Math.sin(player.angle) * moveSpeed;
        newY += Math.cos(player.angle) * moveSpeed;
    }
    if (keys.s) {
        newX -= Math.sin(player.angle) * moveSpeed;
        newY -= Math.cos(player.angle) * moveSpeed;
    }
    if (keys.a) {
        newX += Math.cos(player.angle) * moveSpeed;
        newY -= Math.sin(player.angle) * moveSpeed;
    }
    if (keys.d) {
        newX -= Math.cos(player.angle) * moveSpeed;
        newY += Math.sin(player.angle) * moveSpeed;
    }

    // Check collisions
    if (!checkCollision(newX, player.y, obstacles)) player.x = newX;
    if (!checkCollision(player.x, newY, obstacles)) player.y = newY;

    // Apply gravity and jumping
    player.z += player.jumpVelocity;
    player.jumpVelocity -= gravity;
    if (player.z <= 1.6) {
        player.z = 1.6;
        player.jumpVelocity = 0;
        player.isGrounded = true;
    }
    for (let plat of platforms) {
        if (player.x + 0.5 > plat.x - plat.width / 2 &&
            player.x - 0.5 < plat.x + plat.width / 2 &&
            player.y + 0.5 > plat.y - plat.height / 2 &&
            player.y - 0.5 < plat.y + plat.height / 2 &&
            player.z <= plat.z + 0.5 && player.z >= plat.z - 0.5) {
            player.z = plat.z + 0.5;
            player.jumpVelocity = 0;
            player.isGrounded = true;
        }
    }

    // Enemy movement
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
        if (dist < 1.5) {
            player.health -= 0.1;
            document.getElementById('health').textContent = `Health: ${Math.round(player.health)}`;
            if (player.health <= 0) {
                alert('Game Over! Score: ' + score);
                player.health = 100;
                score = 0;
                document.getElementById('health').textContent = `Health: 100`;
                document.getElementById('score').textContent = `Score: 0`;
            }
        }
    });

    // Render (pseudo-3D using 2D canvas)
    const objects = [...obstacles, ...platforms, ...enemies];
    objects.sort((a, b) => {
        const da = Math.sqrt((player.x - a.x) ** 2 + (player.y - a.y) ** 2);
        const db = Math.sqrt((player.x - b.x) ** 2 + (player.y - b.y) ** 2);
        return db - da;
    });

    objects.forEach(obj => {
        const dx = obj.x - player.x;
        const dy = obj.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20 && dist > 0.1) {
            const angle = Math.atan2(dx, dy) - player.angle;
            const screenX = canvas.width / 2 + Math.tan(angle) * canvas.width / 2;
            const size = 1000 / dist;
            let img = obj.health ? enemyImg : (obj.z ? platformImg : wallImg);
            const height = obj.z ? obj.z : 1;
            ctx.drawImage(img, screenX - size / 2, canvas.height / 2 - size * height / player.z, size, size * height / player.z);
        }
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
```
