const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const petals = [];
for (let i = 0; i < 40; i++) {
    petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        speedX: 0.5 + Math.random() * 1,
        speedY: 0.3 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        hue: 330 + Math.random() * 30
    });
}

function drawPetal(x, y, size, rotation, hue, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size * 0.3, size, -size * 0.1, size, 0);
    ctx.bezierCurveTo(size, size * 0.1, size * 0.5, size * 0.3, 0, 0);
    ctx.fillStyle = `hsla(${hue}, 70%, 75%, ${alpha})`;
    ctx.fill();

    ctx.restore();
}

function animate() {
    ctx.fillStyle = 'rgba(5, 5, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    petals.forEach(petal => {
        petal.wobble += petal.wobbleSpeed;
        petal.x += petal.speedX + Math.sin(petal.wobble) * 0.5;
        petal.y += petal.speedY;
        petal.rotation += petal.rotSpeed;

        if (petal.y > canvas.height + 10) {
            petal.y = -10;
            petal.x = Math.random() * canvas.width;
        }
        if (petal.x > canvas.width + 10) {
            petal.x = -10;
        }

        drawPetal(petal.x, petal.y, petal.size, petal.rotation, petal.hue, 0.6);
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
