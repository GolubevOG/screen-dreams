const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const butterflies = [];
const colors = ['#ff96c8', '#96c8ff', '#c8ff96', '#ffc896', '#c896ff', '#96ffc8'];

class Butterfly {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 10 + Math.random() * 15;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.wingAngle = 0;
        this.wingSpeed = 0.1 + Math.random() * 0.1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.wobble = Math.random() * Math.PI * 2;
    }

    update() {
        this.wobble += 0.02;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5;
        this.y += this.speedY + Math.cos(this.wobble) * 0.5;
        this.wingAngle += this.wingSpeed;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const wingFlap = Math.sin(this.wingAngle) * 0.5;

        ctx.beginPath();
        ctx.ellipse(-this.size * 0.5, 0, this.size, this.size * 0.6, -0.3 + wingFlap, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.size * 0.5, 0, this.size, this.size * 0.6, 0.3 - wingFlap, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.2, this.size * 0.4, this.size * 0.3, -0.5 + wingFlap, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.size * 0.3, -this.size * 0.2, this.size * 0.4, this.size * 0.3, 0.5 - wingFlap, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 2, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();

        ctx.restore();
    }
}

for (let i = 0; i < 15; i++) {
    butterflies.push(new Butterfly());
}

function draw() {
    ctx.fillStyle = 'rgba(10, 15, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    butterflies.forEach(butterfly => {
        butterfly.update();
        butterfly.draw();
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
