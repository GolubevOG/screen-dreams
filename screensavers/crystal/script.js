const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const crystals = [];
for (let i = 0; i < 8; i++) {
    crystals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        hue: Math.random() * 60 + 200,
        facets: 5 + Math.floor(Math.random() * 3),
        shimmer: Math.random() * Math.PI * 2
    });
}

function drawCrystal(crystal, shimmerAlpha) {
    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.rotation);

    ctx.beginPath();
    for (let i = 0; i < crystal.facets; i++) {
        const angle = (i / crystal.facets) * Math.PI * 2;
        const r = crystal.size * (0.8 + Math.sin(angle * 2) * 0.2);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.strokeStyle = `hsla(${crystal.hue}, 60%, 70%, ${0.3 + shimmerAlpha * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, crystal.size);
    grad.addColorStop(0, `hsla(${crystal.hue}, 60%, 80%, ${0.1 + shimmerAlpha * 0.1})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    crystals.forEach(crystal => {
        crystal.rotation += crystal.rotSpeed;
        crystal.shimmer += 0.02;
        crystal.x += Math.sin(crystal.shimmer * 0.5) * 0.3;
        crystal.y += Math.cos(crystal.shimmer * 0.3) * 0.2;

        if (crystal.x < -50) crystal.x = canvas.width + 50;
        if (crystal.x > canvas.width + 50) crystal.x = -50;
        if (crystal.y < -50) crystal.y = canvas.height + 50;
        if (crystal.y > canvas.height + 50) crystal.y = -50;

        const shimmerAlpha = (Math.sin(crystal.shimmer) + 1) / 2;
        drawCrystal(crystal, shimmerAlpha);

        for (let i = 0; i < 3; i++) {
            const sparkAngle = crystal.shimmer + i * 2;
            const sparkX = crystal.x + Math.cos(sparkAngle) * crystal.size * 0.5;
            const sparkY = crystal.y + Math.sin(sparkAngle) * crystal.size * 0.5;
            const sparkAlpha = shimmerAlpha * 0.5;

            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${crystal.hue + 30}, 80%, 90%, ${sparkAlpha})`;
            ctx.fill();
        }
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
