const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const fireParticles = [];

function createFireParticle() {
    const x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4;
    return {
        x: x,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 8 + 4),
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 20 + 10
    };
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 15; i++) {
        fireParticles.push(createFireParticle());
    }

    for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];

        const r = 255;
        const g = Math.floor(100 + p.life * 100);
        const b = Math.floor(p.life * 50);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.life * 0.8})`);
        gradient.addColorStop(1, `rgba(${r}, ${g * 0.5}, 0, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.99;
        p.vx += (Math.random() - 0.5) * 0.5;
        p.life -= p.decay;

        if (p.life <= 0) {
            fireParticles.splice(i, 1);
        }
    }

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
