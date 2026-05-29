const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let time = 0;

function drawLightning(x1, y1, x2, y2, thickness, depth) {
    if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(150, 150, 255, ${0.5 + Math.random() * 0.5})`;
        ctx.lineWidth = thickness;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(200, 200, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = thickness * 3;
        ctx.stroke();

        return;
    }

    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 100;
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 50;

    drawLightning(x1, y1, midX, midY, thickness * 0.7, depth - 1);
    drawLightning(midX, midY, x2, y2, thickness * 0.7, depth - 1);

    if (Math.random() > 0.7 && depth > 2) {
        const branchX = midX + (Math.random() - 0.5) * 200;
        const branchY = midY + Math.random() * 100;
        drawLightning(midX, midY, branchX, branchY, thickness * 0.5, depth - 2);
    }
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() > 0.97) {
        const startX = Math.random() * canvas.width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 300;
        const endY = canvas.height;

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#9696ff';

        drawLightning(startX, startY, endX, endY, 3, 6);

        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(200, 200, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (Math.random() > 0.99) {
        ctx.fillStyle = 'rgba(200, 200, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    time++;
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
