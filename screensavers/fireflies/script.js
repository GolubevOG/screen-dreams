const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const fireflies = [];

class Firefly {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 2 + Math.random() * 3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.glow = Math.random() * Math.PI * 2;
        this.glowSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.glow += this.glowSpeed;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        const alpha = (Math.sin(this.glow) + 1) / 2;

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) {
    fireflies.push(new Firefly());
}

function draw() {
    ctx.fillStyle = 'rgba(10, 15, 10, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireflies.forEach(firefly => {
        firefly.update();
        firefly.draw();
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
