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
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const amplitude = 100;
    const numPoints = 30;
    const spacing = canvas.height / numPoints;

    // Первая цепочка ДНК
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 3;

    for (let i = 0; i < numPoints; i++) {
        const y = i * spacing;
        const x = centerX + Math.sin(y * 0.01 + time * 0.02) * amplitude;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Вторая цепочка ДНК (зеркальная)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(240, 147, 251, 0.8)';
    ctx.lineWidth = 3;

    for (let i = 0; i < numPoints; i++) {
        const y = i * spacing;
        const x = centerX + Math.sin(y * 0.01 + time * 0.02 + Math.PI) * amplitude;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Связи между цепочками
    for (let i = 0; i < numPoints; i++) {
        const y = i * spacing;
        const x1 = centerX + Math.sin(y * 0.01 + time * 0.02) * amplitude;
        const x2 = centerX + Math.sin(y * 0.01 + time * 0.02 + Math.PI) * amplitude;

        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Точки на концах связей
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x1, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 4, 0, Math.PI * 2);
        ctx.fill();
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
