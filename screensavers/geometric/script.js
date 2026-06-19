const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const shapes = [];
for (let i = 0; i < 15; i++) {
    shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        type: Math.floor(Math.random() * 3),
        hue: Math.random() * 360,
        hueSpeed: 0.5 + Math.random()
    });
}

function drawTriangle(x, y, size, rotation, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawSquare(x, y, size, rotation, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawCircle(x, y, size, rotation, hue) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
        shape.x += Math.sin(shape.rotation) * 0.5;
        shape.y += Math.cos(shape.rotation) * 0.3;
        shape.rotation += shape.rotSpeed;
        shape.hue = (shape.hue + shape.hueSpeed) % 360;

        if (shape.x < -50) shape.x = canvas.width + 50;
        if (shape.x > canvas.width + 50) shape.x = -50;
        if (shape.y < -50) shape.y = canvas.height + 50;
        if (shape.y > canvas.height + 50) shape.y = -50;

        switch (shape.type) {
            case 0:
                drawTriangle(shape.x, shape.y, shape.size, shape.rotation, shape.hue);
                break;
            case 1:
                drawSquare(shape.x, shape.y, shape.size, shape.rotation, shape.hue);
                break;
            case 2:
                drawCircle(shape.x, shape.y, shape.size, shape.rotation, shape.hue);
                break;
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
