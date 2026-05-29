const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const bubbles = [];

class Bubble {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;
        this.radius = 5 + Math.random() * 30;
        this.speedY = 0.5 + Math.random() * 1.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
        this.hue = Math.random() * 60 + 180;
        this.alpha = 0.3 + Math.random() * 0.4;
    }

    update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;

        if (this.y < -this.radius * 2) {
            this.reset();
        }
    }

    draw() {
        ctx.save();

        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 80%, ${this.alpha * 0.8})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 60%, ${this.alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 50%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.8})`;
        ctx.fill();

        ctx.restore();
    }
}

for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
}

function draw() {
    ctx.fillStyle = 'rgba(10, 22, 40, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
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
