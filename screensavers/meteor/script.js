const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const meteors = [];
const stars = [];

for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2
    });
}

function spawnMeteor() {
    const angle = Math.PI * 0.25 + Math.random() * Math.PI * 0.5;
    const speed = 4 + Math.random() * 6;
    meteors.push({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        trail: [],
        life: 1,
        color: Math.random() > 0.5 ? [255, 150, 50] : [255, 200, 100]
    });
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 5, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.twinkle += 0.03;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    });

    if (Math.random() < 0.03) spawnMeteor();

    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 20) m.trail.shift();

        m.x += m.vx;
        m.y += m.vy;

        for (let j = 0; j < m.trail.length; j++) {
            const t = m.trail[j];
            const alpha = (j / m.trail.length) * m.life * 0.6;
            const r = m.size * (j / m.trail.length);
            ctx.beginPath();
            ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${alpha})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${m.life})`;
        ctx.fill();

        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 3);
        glow.addColorStop(0, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${m.life * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        if (m.x > canvas.width + 50 || m.y > canvas.height + 50) {
            meteors.splice(i, 1);
        }
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
