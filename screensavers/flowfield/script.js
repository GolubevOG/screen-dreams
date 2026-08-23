const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const COUNT = 320;
const SPEED = 1.5;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

const particles = [];
for (let i = 0; i < COUNT; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        life: 100 + Math.random() * 300
    });
}

function fieldAngle(x, y, t) {
    return (
        Math.sin(x * 0.0021 + t * 0.00021) * 1.9 +
        Math.cos(y * 0.0024 - t * 0.00017) * 1.9 +
        Math.sin((x + y) * 0.0011 + t * 0.00013) * 1.6 +
        Math.cos((x - y) * 0.0017 - t * 0.00009) * 1.4
    );
}

function respawn(p) {
    p.x = Math.random() * canvas.width;
    p.y = Math.random() * canvas.height;
    p.life = 100 + Math.random() * 300;
}

function animate(timestamp) {
    const t = timestamp || 0;

    ctx.fillStyle = 'rgba(6, 8, 14, 0.055)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1.4;

    for (let i = 0; i < COUNT; i++) {
        const p = particles[i];

        const a = fieldAngle(p.x, p.y, t);

        const nx = p.x + Math.cos(a) * SPEED;
        const ny = p.y + Math.sin(a) * SPEED;

        const hue = (t * 0.06 + a * 40 + i * 0.4) % 360;

        ctx.strokeStyle = `hsla(${hue}, 85%, 62%, 0.65)`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;

        if (p.x < -10) p.x += canvas.width + 20;
        else if (p.x > canvas.width + 10) p.x -= canvas.width + 20;
        if (p.y < -10) p.y += canvas.height + 20;
        else if (p.y > canvas.height + 10) p.y -= canvas.height + 20;

        p.life--;
        if (p.life <= 0) respawn(p);
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
