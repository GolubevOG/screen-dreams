const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const neonColors = [
    [255, 0, 255],
    [0, 255, 255],
    [255, 0, 128],
    [0, 128, 255],
    [128, 0, 255]
];

const lines = [];
for (let i = 0; i < 12; i++) {
    lines.push({
        y: (i / 12) * canvas.height,
        color: neonColors[i % neonColors.length],
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
        thickness: 2 + Math.random() * 3
    });
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
        line.phase += line.speed;
        const alpha = 0.4 + Math.sin(line.phase) * 0.3;
        const glowAlpha = alpha * 0.5;

        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(${line.color[0]}, ${line.color[1]}, ${line.color[2]}, ${glowAlpha})`;

        ctx.beginPath();
        ctx.moveTo(0, line.y);
        for (let x = 0; x <= canvas.width; x += 3) {
            const y = line.y + Math.sin(x * 0.01 + line.phase) * 15;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${line.color[0]}, ${line.color[1]}, ${line.color[2]}, ${alpha})`;
        ctx.lineWidth = line.thickness;
        ctx.stroke();

        ctx.shadowBlur = 40;
        ctx.strokeStyle = `rgba(${line.color[0]}, ${line.color[1]}, ${line.color[2]}, ${alpha * 0.3})`;
        ctx.lineWidth = line.thickness * 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
    });

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
