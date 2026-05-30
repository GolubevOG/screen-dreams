const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let time = 0;

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const fontSize = Math.min(canvas.width / 5, canvas.height / 3);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < timeStr.length; i++) {
        const char = timeStr[i];
        const x = centerX + (i - timeStr.length / 2 + 0.5) * fontSize * 0.6;
        const y = centerY + Math.sin(time * 0.05 + i * 0.5) * 10;

        const hue = (time * 2 + i * 30) % 360;

        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.3)`;
        ctx.fillText(char, x + 3, y + 3);

        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.9)`;
        ctx.fillText(char, x, y);
    }

    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const size = i % 5 === 0 ? 4 : 2;
        const alpha = i % 5 === 0 ? 0.8 : 0.3;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 200, ${alpha})`;
        ctx.fill();
    }

    const secondAngle = (now.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(secondAngle) * radius * 0.9, centerY + Math.sin(secondAngle) * radius * 0.9);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const minuteAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(minuteAngle) * radius * 0.7, centerY + Math.sin(minuteAngle) * radius * 0.7);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();

    const hourAngle = ((now.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(hourAngle) * radius * 0.5, centerY + Math.sin(hourAngle) * radius * 0.5);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.5)';
    ctx.lineWidth = 6;
    ctx.stroke();

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
