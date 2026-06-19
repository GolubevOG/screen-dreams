const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const drops = [];
const splashes = [];

for (let i = 0; i < 150; i++) {
    drops.push({
        x: canvas.width * 0.4 + Math.random() * canvas.width * 0.2,
        y: Math.random() * canvas.height * 0.7,
        speed: 3 + Math.random() * 5,
        length: 10 + Math.random() * 20,
        width: 1 + Math.random() * 2
    });
}

function createSplash(x, y) {
    for (let i = 0; i < 5; i++) {
        splashes.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 3,
            size: 1 + Math.random() * 2,
            life: 1
        });
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 10, 30, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rockLeft = canvas.width * 0.35;
    const rockRight = canvas.width * 0.65;
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(rockLeft - 20, 0, 20, canvas.height * 0.6);
    ctx.fillRect(rockRight, 0, 20, canvas.height * 0.6);

    drops.forEach(drop => {
        drop.y += drop.speed;
        if (drop.y > canvas.height * 0.75) {
            createSplash(drop.x, canvas.height * 0.75);
            drop.y = -drop.length;
            drop.x = canvas.width * 0.4 + Math.random() * canvas.width * 0.2;
        }

        const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        grad.addColorStop(0, 'rgba(100, 180, 255, 0.1)');
        grad.addColorStop(0.5, 'rgba(150, 200, 255, 0.6)');
        grad.addColorStop(1, 'rgba(200, 230, 255, 0.3)');
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = drop.width;
        ctx.stroke();
    });

    for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15;
        s.life -= 0.02;

        if (s.life <= 0) {
            splashes.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 255, ${s.life * 0.6})`;
        ctx.fill();
    }

    const poolY = canvas.height * 0.78;
    const poolGrad = ctx.createLinearGradient(0, poolY, 0, canvas.height);
    poolGrad.addColorStop(0, 'rgba(0, 50, 100, 0.5)');
    poolGrad.addColorStop(1, 'rgba(0, 20, 50, 0.8)');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(0, poolY, canvas.width, canvas.height - poolY);

    for (let i = 0; i < 5; i++) {
        const waveY = poolY + 5 + i * 8;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= canvas.width; x += 5) {
            const y = waveY + Math.sin(x * 0.02 + i * 0.5) * 3;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(100, 180, 255, ${0.2 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

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
