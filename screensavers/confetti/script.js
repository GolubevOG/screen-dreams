const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const confetti = [];
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe', '#00b894', '#fdcb6e', '#e17055'];

class ConfettiPiece {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.width = 8 + Math.random() * 8;
        this.height = 4 + Math.random() * 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedY = 2 + Math.random() * 3;
        this.speedX = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05 + Math.random() * 0.05;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5;
        this.rotation += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;

        if (this.y > canvas.height + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

for (let i = 0; i < 150; i++) {
    confetti.push(new ConfettiPiece());
}

function draw() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(piece => {
        piece.update();
        piece.draw();
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
