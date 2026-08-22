const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initDrops();
}
window.addEventListener('resize', resize);

const fontSize = 14;
let columns = 0;
let drops = [];
let speeds = [];
const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]|/<>?!@#$%^&*()';
const charSets = {};

function initDrops() {
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns);
    speeds = new Array(columns);
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
        speeds[i] = 0.5 + Math.random() * 1.5;
    }
}

resize();

function getChar(col) {
    if (!charSets[col] || Math.random() > 0.95) {
        charSets[col] = chars[Math.floor(Math.random() * chars.length)];
    }
    return charSets[col];
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#0f0';

    for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const char = getChar(i);
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
            speeds[i] = 0.5 + Math.random() * 1.5;
        }

        drops[i] += speeds[i];
    }

    // Случайные вспышки
    if (Math.random() > 0.99) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(x, y, fontSize * 3, fontSize);
    }
}

let lastFrame = 0;

function loop(timestamp) {
    if (timestamp - lastFrame >= 33) {
        lastFrame = timestamp;
        draw();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

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
