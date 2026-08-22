const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildGradients();
}
window.addEventListener('resize', resize);

let time = 0;
const waves = [];

for (let i = 0; i < 8; i++) {
    waves.push({
        amplitude: 20 + i * 15,
        frequency: 0.01 + i * 0.002,
        speed: 0.01 + i * 0.003,
        offset: i * 0.8,
        hue: 180 + i * 20
    });
}

let waveGradients = [];
let glowGradient = null;

function buildGradients() {
    waveGradients = waves.map(wave => {
        const g = ctx.createLinearGradient(0, canvas.height / 2 - wave.amplitude, 0, canvas.height / 2 + wave.amplitude);
        g.addColorStop(0, `hsla(${wave.hue}, 70%, 50%, 0)`);
        g.addColorStop(0.5, `hsla(${wave.hue}, 70%, 50%, 0.3)`);
        g.addColorStop(1, `hsla(${wave.hue}, 70%, 50%, 0)`);
        return g;
    });

    glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
    glowGradient.addColorStop(0, 'rgba(0, 200, 255, 0.3)');
    glowGradient.addColorStop(1, 'transparent');
}

resize();

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x <= canvas.width; x += 2) {
            const y = canvas.height / 2 +
                Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
                Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.5) * wave.amplitude * 0.5;
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = waveGradients[index];
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    for (let i = 0; i < 3; i++) {
        const x = (Math.sin(time * 0.01 + i * 2) * 0.3 + 0.5) * canvas.width;
        const y = canvas.height / 2 + Math.sin(time * 0.02 + i) * 50;

        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        ctx.restore();
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
