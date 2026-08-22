const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    pivotX = canvas.width / 2;
    pivotY = canvas.height * 0.2;
    length = Math.min(canvas.width, canvas.height) * 0.35;
}
window.addEventListener('resize', resize);

let pivotX, pivotY, length;
resize();

let angle = Math.PI / 4;
let angularVel = 0;
const gravity = 1.8;
const dampingRate = 0.06;
let lastTimestamp = null;

function animate(timestamp) {
    if (lastTimestamp === null) {
        lastTimestamp = timestamp;
    }
    let dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    if (dt > 0.05) {
        dt = 0.05;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const acc = -gravity * Math.sin(angle);
    angularVel += acc * dt;
    angularVel *= Math.exp(-dampingRate * dt);
    angle += angularVel * dt;

    const bobX = pivotX + Math.sin(angle) * length;
    const bobY = pivotY + Math.cos(angle) * length;

    trail.push({ x: bobX, y: bobY });
    if (trail.length > 80) trail.shift();

    for (let i = 0; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.4;
        const r = 3 + (i / trail.length) * 3;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 170, 80, ${alpha})`;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = 'rgba(200, 170, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 170, 80, 0.8)';
    ctx.fill();

    const glow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 15);
    glow.addColorStop(0, 'rgba(255, 220, 100, 0.6)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#c8aa50';
    ctx.fill();

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
