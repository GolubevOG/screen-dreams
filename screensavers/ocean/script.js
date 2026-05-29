const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let time = 0;
const waves = [];

for (let i = 0; i < 5; i++) {
    waves.push({
        amplitude: 20 + i * 10,
        frequency: 0.02 - i * 0.002,
        speed: 0.02 + i * 0.005,
        offset: i * 0.5,
        color: `rgba(0, ${100 + i * 30}, ${200 + i * 10}, ${0.3 - i * 0.05})`
    });
}

const bubbles = [];
for (let i = 0; i < 50; i++) {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        radius: 2 + Math.random() * 8,
        speed: 0.5 + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.5
    });
}

function draw() {
    // Градиентный фон
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#001a33');
    bgGradient.addColorStop(0.5, '#003366');
    bgGradient.addColorStop(1, '#004080');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Волны
    waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.4 + index * 40);

        for (let x = 0; x <= canvas.width; x += 5) {
            const y = canvas.height * 0.4 + index * 40 +
                Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
    });

    // Пузырьки
    bubbles.forEach(bubble => {
        bubble.wobble += 0.05;
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.wobble) * 0.5;

        if (bubble.y < -bubble.radius * 2) {
            bubble.y = canvas.height + bubble.radius;
            bubble.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 255, ${bubble.alpha * 0.3})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.8})`;
        ctx.fill();
    });

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
