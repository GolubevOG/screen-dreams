const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const ripples = [];
const colors = ['#64c8ff', '#ff64c8', '#64ff64', '#ffff64', '#ff6464'];

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 200 + Math.random() * 200;
        this.speed = 2 + Math.random() * 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0.8;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color.replace(')', `, ${this.alpha})`).replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    isDead() {
        return this.radius >= this.maxRadius;
    }
}

canvas.addEventListener('click', (e) => {
    ripples.push(new Ripple(e.clientX, e.clientY));
});

canvas.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.9) {
        ripples.push(new Ripple(e.clientX, e.clientY));
    }
});

setInterval(() => {
    ripples.push(new Ripple(Math.random() * canvas.width, Math.random() * canvas.height));
}, 2000);

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].draw();
        if (ripples[i].isDead()) {
            ripples.splice(i, 1);
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
