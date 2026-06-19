const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const pixelSize = 8;
const columns = Math.floor(canvas.width / pixelSize);
const drops = [];
for (let i = 0; i < columns; i++) {
    drops.push(Math.random() * canvas.height);
}

const chars = '01アイウエオカキクケコ';

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${pixelSize}px monospace`;

    for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * pixelSize;
        const y = drops[i];

        const brightness = Math.random();
        if (brightness > 0.7) {
            ctx.fillStyle = '#0f0';
        } else if (brightness > 0.4) {
            ctx.fillStyle = '#0a0';
        } else {
            ctx.fillStyle = '#050';
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i] += pixelSize;
    }

    requestAnimationFrame(animate);
}

animate();

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
