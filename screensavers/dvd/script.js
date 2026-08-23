const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
    resize();
    x = Math.min(x, Math.max(0, canvas.width - LOGO_W));
    y = Math.min(y, Math.max(0, canvas.height - LOGO_H));
});
resize();

const LOGO_W = 170;
const LOGO_H = 95;

let x = Math.random() * Math.max(1, canvas.width - LOGO_W);
let y = Math.random() * Math.max(1, canvas.height - LOGO_H);
let vx = 2.6;
let vy = 2.0;
let hue = 195;
let cornerHits = 0;
let cornerCooldown = 0;

function drawLogo() {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = `hsl(${hue}, 75%, 52%)`;
    ctx.fillRect(0, 0, LOGO_W, LOGO_H);

    ctx.strokeStyle = `hsl(${hue}, 85%, 72%)`;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, LOGO_W - 3, LOGO_H - 3);

    ctx.fillStyle = '#fff';
    ctx.font = 'italic bold 46px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', LOGO_W / 2, LOGO_H / 2 - 6);

    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('VIDEO', LOGO_W / 2, LOGO_H / 2 + 28);

    ctx.beginPath();
    ctx.arc(LOGO_W - 26, LOGO_H / 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 85%, 72%)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(LOGO_W - 26, LOGO_H / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 75%, 52%)`;
    ctx.fill();

    ctx.restore();
}

function animate() {
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let bouncedX = false;
    let bouncedY = false;

    x += vx;
    y += vy;

    if (x <= 0) { x = 0; vx = Math.abs(vx); bouncedX = true; }
    if (x >= canvas.width - LOGO_W) { x = canvas.width - LOGO_W; vx = -Math.abs(vx); bouncedX = true; }
    if (y <= 0) { y = 0; vy = Math.abs(vy); bouncedY = true; }
    if (y >= canvas.height - LOGO_H) { y = canvas.height - LOGO_H; vy = -Math.abs(vy); bouncedY = true; }

    if (bouncedX || bouncedY) {
        hue = (hue + 47) % 360;

        if (cornerCooldown === 0) {
            const distToCornerX = Math.min(x, canvas.width - LOGO_W - x);
            const distToCornerY = Math.min(y, canvas.height - LOGO_H - y);
            const isCorner = (bouncedX && bouncedY) || (distToCornerX < 16 && distToCornerY < 16);
            if (isCorner) {
                cornerHits++;
                cornerCooldown = 45;
            }
        }
    }

    if (cornerCooldown > 0) cornerCooldown--;

    drawLogo();

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText('углов: ' + cornerHits, canvas.width / 2, 24);

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
