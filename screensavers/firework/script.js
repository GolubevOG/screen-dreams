const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const fireworks = [];
const particles = [];
const colors = ['#ff0066', '#00ff66', '#6600ff', '#ffff00', '#00ffff', '#ff6600', '#ff00ff'];

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
}

class Firework {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = 100 + Math.random() * (canvas.height * 0.4);
        this.speed = 5 + Math.random() * 5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rgb = hexToRgb(this.color);
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();

        this.y -= this.speed;

        if (this.y <= this.targetY) {
            this.explode();
            return true;
        }
        return false;
    }

    draw() {
        this.trail.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.rgb}, ${i / this.trail.length})`;
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    explode() {
        for (let i = 0; i < 80; i++) {
            const angle = (i / 80) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particles.push(new Particle(this.x, this.y, angle, speed, this.rgb));
        }
    }
}

class Particle {
    constructor(x, y, angle, speed, rgb) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.rgb = rgb;
        this.alpha = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.rgb}, ${Math.max(this.alpha, 0)})`;
        ctx.fill();
    }

    isDead() {
        return this.alpha <= 0;
    }
}

let lastSpawn = 0;

function draw(timestamp) {
    if (timestamp - lastSpawn >= 800) {
        fireworks.push(new Firework());
        lastSpawn = timestamp;
    }

    ctx.fillStyle = 'rgba(10, 10, 26, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = fireworks.length - 1; i >= 0; i--) {
        if (fireworks[i].update()) {
            fireworks.splice(i, 1);
        } else {
            fireworks[i].draw();
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
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
