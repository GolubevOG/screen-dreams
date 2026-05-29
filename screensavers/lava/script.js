const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const blobs = [];

for (let i = 0; i < 15; i++) {
    blobs.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        radius: 30 + Math.random() * 60,
        speedY: -(0.5 + Math.random() * 1.5),
        speedX: (Math.random() - 0.5) * 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
    });
}

function draw() {
    ctx.fillStyle = 'rgba(26, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Фоновый градиент
    const bgGradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    bgGradient.addColorStop(0, '#ff4500');
    bgGradient.addColorStop(0.3, '#ff6600');
    bgGradient.addColorStop(0.6, '#cc0000');
    bgGradient.addColorStop(1, '#1a0000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    blobs.forEach(blob => {
        blob.wobble += blob.wobbleSpeed;
        blob.x += blob.speedX + Math.sin(blob.wobble) * 2;
        blob.y += blob.speedY;

        if (blob.y < -blob.radius * 2) {
            blob.y = canvas.height + blob.radius;
            blob.x = Math.random() * canvas.width;
        }

        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius
        );
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.7)');
        gradient.addColorStop(0.6, 'rgba(200, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Внутреннее свечение
        const innerGradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius * 0.5
        );
        innerGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        innerGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();
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
