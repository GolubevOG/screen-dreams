const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const flakes = [];
const flakeCount = 400;

for (let i = 0; i < flakeCount; i++) {
    flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        wind: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.4
    });
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    flakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind + Math.sin(flake.y * 0.01) * 0.3;

        if (flake.y > canvas.height + flake.radius) {
            flake.y = -flake.radius;
            flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width + flake.radius) {
            flake.x = -flake.radius;
        }
        if (flake.x < -flake.radius) {
            flake.x = canvas.width + flake.radius;
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
