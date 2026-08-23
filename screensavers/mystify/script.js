const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TRAIL = 14;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
    resize();
    shapes.forEach(shape => {
        shape.points.forEach(p => {
            p.x = Math.min(p.x, canvas.width);
            p.y = Math.min(p.y, canvas.height);
        });
    });
});
resize();

function makePoint() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7
    };
}

function makeShape(hue) {
    return {
        points: [makePoint(), makePoint(), makePoint(), makePoint()],
        history: [],
        hue: hue
    };
}

const shapes = [makeShape(185), makeShape(320)];

function updateShape(shape) {
    shape.points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= canvas.width) {
            p.vx *= -1;
            p.x = Math.max(0, Math.min(p.x, canvas.width));
        }
        if (p.y <= 0 || p.y >= canvas.height) {
            p.vy *= -1;
            p.y = Math.max(0, Math.min(p.y, canvas.height));
        }
    });

    shape.history.push(shape.points.map(p => ({ x: p.x, y: p.y })));
    if (shape.history.length > TRAIL) {
        shape.history.shift();
    }

    shape.hue = (shape.hue + 0.15) % 360;
}

function drawShape(shape) {
    ctx.lineJoin = 'round';

    shape.history.forEach((frame, i) => {
        const depth = (i + 1) / shape.history.length;
        const isHead = i === shape.history.length - 1;

        ctx.beginPath();
        ctx.moveTo(frame[0].x, frame[0].y);
        for (let k = 1; k < frame.length; k++) {
            ctx.lineTo(frame[k].x, frame[k].y);
        }
        ctx.closePath();

        ctx.strokeStyle = `hsla(${(shape.hue + i * 7) % 360}, 90%, ${45 + depth * 25}%, ${depth * 0.9})`;
        ctx.lineWidth = isHead ? 2.5 : 1.3;
        ctx.stroke();
    });
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 10, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
        updateShape(shape);
        drawShape(shape);
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

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
