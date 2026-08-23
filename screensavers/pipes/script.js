const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL = 44;
const TUBE = 16;
const SPEED = 3;
const MAX_SEGMENTS = 900;
const DIRS = [[1, 0], [0, -1], [-1, 0], [0, 1]];

let px, py, dir, segLen, traveled, hue, totalSegments;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', () => {
    resize();
    startPipe();
});
resize();

function snap(v) {
    return Math.round(v / CELL) * CELL;
}

function canMove(d) {
    const nx = px + DIRS[d][0] * CELL;
    const ny = py + DIRS[d][1] * CELL;
    return nx > 0 && nx < canvas.width && ny > 0 && ny < canvas.height;
}

function newSegment() {
    segLen = CELL * (1 + Math.floor(Math.random() * 4));
    traveled = 0;
}

function startPipe() {
    px = snap(CELL + Math.random() * (canvas.width - CELL * 2));
    py = snap(CELL + Math.random() * (canvas.height - CELL * 2));
    dir = Math.floor(Math.random() * 4);
    if (!canMove(dir)) {
        dir = (dir + 2) % 4;
    }
    hue = Math.random() * 360;
    newSegment();
}

function clearScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    totalSegments = 0;
}

clearScreen();
startPipe();

function drawJoint() {
    ctx.fillStyle = `hsl(${hue}, 70%, 32%)`;
    ctx.beginPath();
    ctx.arc(px, py, TUBE / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animate() {
    const dx = DIRS[dir][0] * SPEED;
    const dy = DIRS[dir][1] * SPEED;

    ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.lineWidth = TUBE;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(px, py);
    px += dx;
    py += dy;
    ctx.lineTo(px, py);
    ctx.stroke();

    traveled += SPEED;

    let hitWall = px <= CELL || px >= canvas.width - CELL || py <= CELL || py >= canvas.height - CELL;

    if (hitWall) {
        px = Math.max(CELL, Math.min(px, canvas.width - CELL));
        py = Math.max(CELL, Math.min(py, canvas.height - CELL));
        traveled = segLen;
    }

    if (traveled >= segLen) {
        drawJoint();
        totalSegments++;

        if (totalSegments >= MAX_SEGMENTS) {
            clearScreen();
            startPipe();
            requestAnimationFrame(animate);
            return;
        }

        let nextDir;
        if (!hitWall && Math.random() < 0.5 && canMove(dir)) {
            nextDir = dir;
        } else {
            const turns = [(dir + 1) % 4, (dir + 3) % 4].filter(canMove);
            if (turns.length > 0) {
                nextDir = turns[Math.floor(Math.random() * turns.length)];
            } else if (canMove(dir)) {
                nextDir = dir;
            } else {
                startPipe();
                requestAnimationFrame(animate);
                return;
            }
        }

        dir = nextDir;
        newSegment();
    }

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
