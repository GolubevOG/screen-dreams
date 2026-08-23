const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const COUNT = 60;
const PERCEPTION = 55;
const PERCEPTION_SQ = PERCEPTION * PERCEPTION;
const SEP_DIST = 26;
const SEP_DIST_SQ = SEP_DIST * SEP_DIST;
const MAX_SPEED = 2.4;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const boids = [];
for (let i = 0; i < COUNT; i++) {
    boids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
    });
}

function wrap(b) {
    if (b.x < 0) b.x += canvas.width;
    else if (b.x > canvas.width) b.x -= canvas.width;
    if (b.y < 0) b.y += canvas.height;
    else if (b.y > canvas.height) b.y -= canvas.height;
}

function updateBoid(boid) {
    let centerX = 0, centerY = 0, avgVX = 0, avgVY = 0;
    let sepX = 0, sepY = 0, neighbors = 0;

    for (let j = 0; j < COUNT; j++) {
        const other = boids[j];
        if (other === boid) continue;

        const dx = other.x - boid.x;
        const dy = other.y - boid.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < PERCEPTION_SQ) {
            neighbors++;
            centerX += other.x;
            centerY += other.y;
            avgVX += other.vx;
            avgVY += other.vy;

            if (distSq < SEP_DIST_SQ && distSq > 0.001) {
                sepX -= dx / distSq;
                sepY -= dy / distSq;
            }
        }
    }

    if (neighbors > 0) {
        boid.vx += ((centerX / neighbors - boid.x) * 0.0028) + ((avgVX / neighbors - boid.vx) * 0.06);
        boid.vy += ((centerY / neighbors - boid.y) * 0.0028) + ((avgVY / neighbors - boid.vy) * 0.06);
        boid.vx += sepX * 0.9;
        boid.vy += sepY * 0.9;
    }

    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
    if (speed > MAX_SPEED) {
        boid.vx = (boid.vx / speed) * MAX_SPEED;
        boid.vy = (boid.vy / speed) * MAX_SPEED;
    } else if (speed < 0.7 && speed > 0.001) {
        boid.vx = (boid.vx / speed) * 0.7;
        boid.vy = (boid.vy / speed) * 0.7;
    }

    boid.x += boid.vx;
    boid.y += boid.vy;
    wrap(boid);
}

function drawBoid(boid) {
    const angle = Math.atan2(boid.vy, boid.vx);
    const hue = 190 + (Math.sin(angle) * 0.5 + 0.5) * 100;

    ctx.save();
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, 4.5);
    ctx.lineTo(-3.5, 0);
    ctx.lineTo(-6, -4.5);
    ctx.closePath();

    ctx.fillStyle = `hsl(${hue}, 85%, 62%)`;
    ctx.fill();
    ctx.restore();
}

function animate() {
    ctx.fillStyle = 'rgba(8, 10, 18, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < COUNT; i++) {
        updateBoid(boids[i]);
    }
    for (let i = 0; i < COUNT; i++) {
        drawBoid(boids[i]);
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            window.location.href = '../../index.html';
        }
    }
});
