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

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
}

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 200 + Math.random() * 200;
        this.speed = 2 + Math.random() * 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rgb = hexToRgb(this.color);
        this.alpha = 0.8;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.rgb}, ${this.alpha})`;
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

let lastSpawn = 0;

function draw(timestamp) {
    if (timestamp - lastSpawn >= 2000) {
        ripples.push(new Ripple(Math.random() * canvas.width, Math.random() * canvas.height));
        lastSpawn = timestamp;
    }

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

draw(0);

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
