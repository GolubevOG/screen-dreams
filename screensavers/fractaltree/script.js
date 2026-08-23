const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const DEPTH = 9;
let t = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function branch(x, y, angle, len, width, depth, wind) {
    if (depth === 0 || len < 3) return;

    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;

    ctx.strokeStyle = `hsl(${24 + (DEPTH - depth) * 14}, ${depth > 3 ? 35 : 55}%, ${18 + (DEPTH - depth) * 6}%)`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    if (depth <= 2) {
        const leafHue = ((nx * 7 + ny * 13) | 0) % 2 === 0 ? 340 : 110;
        ctx.fillStyle = `hsla(${leafHue}, 75%, 65%, 0.85)`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.2 + wind * 1.2, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    const spread = 0.42 + wind * 0.05;
    const localWind = wind * (depth / DEPTH);

    branch(nx, ny, angle - spread + localWind * 0.08, len * 0.72, width * 0.7, depth - 1, wind);
    branch(nx, ny, angle + spread + localWind * 0.08, len * 0.72, width * 0.7, depth - 1, wind);
}

function animate() {
    ctx.fillStyle = '#07131a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wind = Math.sin(t * 0.008) * 0.5 + Math.sin(t * 0.0021) * 0.3;

    branch(
        canvas.width / 2,
        canvas.height - 20,
        -Math.PI / 2 + wind * 0.04,
        Math.min(canvas.height, canvas.width) * 0.21,
        11,
        DEPTH,
        wind
    );

    t += 0.016;
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
