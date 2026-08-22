const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const particleCount = 200;
let mouse = { x: null, y: null };

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: `hsla(${220 + Math.random() * 40}, 70%, 60%, ${0.5 + Math.random() * 0.5})`
    });
}

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

const CONNECT_DIST = 100;
const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;
let connectTick = 0;
const connections = [];

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    connectTick++;
    const rebuildConnections = connectTick % 2 === 0;
    if (rebuildConnections) connections.length = 0;

    particles.forEach((p, i) => {
        if (mouse.x !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;

            if (dx * dx + dy * dy < 22500) {
                p.vx += dx * 0.0003;
                p.vy += dy * 0.0003;
            }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (rebuildConnections) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[j].x - p.x;
                const dy = particles[j].y - p.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONNECT_DIST_SQ) {
                    connections.push(
                        p.x, p.y,
                        particles[j].x, particles[j].y,
                        0.2 * (1 - Math.sqrt(distSq) / CONNECT_DIST)
                    );
                }
            }
        }
    });

    for (let k = 0; k < connections.length; k += 5) {
        ctx.beginPath();
        ctx.moveTo(connections[k], connections[k + 1]);
        ctx.lineTo(connections[k + 2], connections[k + 3]);
        ctx.strokeStyle = `rgba(102, 126, 234, ${connections[k + 4]})`;
        ctx.stroke();
    }

    requestAnimationFrame(draw);
}

draw();

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
