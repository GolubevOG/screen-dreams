const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const drops = [];
const dropCount = 500;

for (let i = 0; i < dropCount; i++) {
    drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 10,
        opacity: Math.random() * 0.3 + 0.1,
        width: Math.random() * 1.5 + 0.5
    });
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        gradient.addColorStop(0, `rgba(150, 180, 255, 0)`);
        gradient.addColorStop(1, `rgba(150, 180, 255, ${drop.opacity})`);

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.width;
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
        }
    });

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
