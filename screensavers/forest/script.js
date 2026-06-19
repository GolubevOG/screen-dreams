const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const trees = [];
for (let i = 0; i < 25; i++) {
    trees.push({
        x: Math.random() * canvas.width,
        height: 80 + Math.random() * 150,
        width: 20 + Math.random() * 40,
        shade: Math.random() * 0.3
    });
}

const fireflies = [];
for (let i = 0; i < 30; i++) {
    fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.02 + Math.random() * 0.03
    });
}

let fogOffset = 0;

function drawTree(x, baseY, height, width, shade) {
    ctx.fillStyle = `rgb(${10 + shade * 20}, ${40 + shade * 30}, ${15 + shade * 15})`;
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x - width / 2, baseY);
    ctx.lineTo(x + width / 2, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${30 + shade * 20}, ${20 + shade * 10}, ${10})`;
    ctx.fillRect(x - 3, baseY, 6, 15);
}

function animate() {
    ctx.fillStyle = '#050a05';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const groundY = canvas.height * 0.85;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    trees.sort((a, b) => a.height - b.height);
    trees.forEach(tree => {
        drawTree(tree.x, groundY, tree.height, tree.width, tree.shade);
    });

    fogOffset += 0.2;
    for (let i = 0; i < 3; i++) {
        const gradient = ctx.createLinearGradient(0, groundY - 60 + i * 30, 0, groundY + 20);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(100, 150, 100, ${0.04 - i * 0.01})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(
            Math.sin(fogOffset * 0.01 + i) * 50 - 50,
            groundY - 60 + i * 30,
            canvas.width + 100,
            80
        );
    }

    fireflies.forEach(ff => {
        ff.x += ff.speedX;
        ff.y += ff.speedY;
        ff.phase += ff.phaseSpeed;

        if (ff.x < 0 || ff.x > canvas.width) ff.speedX *= -1;
        if (ff.y < groundY - 150 || ff.y > groundY) ff.speedY *= -1;

        const alpha = (Math.sin(ff.phase) + 1) / 2;
        const glow = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.size * 5);
        glow.addColorStop(0, `rgba(255, 255, 100, ${alpha * 0.6})`);
        glow.addColorStop(0.5, `rgba(200, 255, 50, ${alpha * 0.2})`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.fill();
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
