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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Звёзды
    if (Math.random() > 0.9) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            1, 1
        );
    }

    // Полосы северного сияния
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3 + i * 30);

        for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height * 0.3 + i * 30 +
                Math.sin(x * 0.005 + time * 0.01 + i) * 50 +
                Math.sin(x * 0.01 + time * 0.02) * 20;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, canvas.height * 0.2, 0, canvas.height * 0.6);
        gradient.addColorStop(0, `rgba(0, 255, 150, ${0.1 - i * 0.015})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 255, ${0.08 - i * 0.01})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Светящиеся частицы
    for (let i = 0; i < 3; i++) {
        const x = (Math.sin(time * 0.01 + i * 2) * 0.5 + 0.5) * canvas.width;
        const y = canvas.height * 0.3 + Math.sin(time * 0.015 + i) * 50;

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
        particleGradient.addColorStop(0, 'rgba(0, 255, 200, 0.3)');
        particleGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.1)');
        particleGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, 100, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
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
