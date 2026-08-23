const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PAD_W = 12;
const PADDLE_H = 90;
const MARGIN = 34;
const WIN_SCORE = 11;

let ball = { x: 0, y: 0, vx: 0, vy: 0 };
let leftY, rightY;
let scoreL = 0, scoreR = 0;
let serveTimer = 40;
let aiOffsetL = 0, aiOffsetR = 0;
let offsetTimer = 0;
let flashText = '';
let flashTimer = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    leftY = canvas.height / 2;
    rightY = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

function serve(direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = Math.random() * 0.7 - 0.35;
    const speed = 5.5;
    ball.vx = Math.cos(angle) * speed * direction;
    ball.vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 2;
    serveTimer = 45;
}

serve(1);

function movePaddle(currentY, targetY, maxSpeed) {
    const diff = targetY - currentY;
    if (Math.abs(diff) > maxSpeed) {
        return currentY + Math.sign(diff) * maxSpeed;
    }
    return targetY;
}

function update() {
    offsetTimer--;
    if (offsetTimer <= 0) {
        offsetTimer = 40 + Math.random() * 30 | 0;
        aiOffsetL = (Math.random() - 0.5) * PADDLE_H * 0.8;
        aiOffsetR = (Math.random() - 0.5) * PADDLE_H * 0.8;
    }

    leftY = movePaddle(leftY, ball.y + aiOffsetL, 4.3);
    rightY = movePaddle(rightY, ball.y + aiOffsetR, 4.3);

    leftY = Math.max(PADDLE_H / 2, Math.min(canvas.height - PADDLE_H / 2, leftY));
    rightY = Math.max(PADDLE_H / 2, Math.min(canvas.height - PADDLE_H / 2, rightY));

    if (flashTimer > 0) flashTimer--;

    if (serveTimer > 0) {
        serveTimer--;
        return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 5 || ball.y >= canvas.height - 5) {
        ball.vy *= -1;
        ball.y = Math.max(5, Math.min(ball.y, canvas.height - 5));
    }

    const leftEdge = MARGIN + PAD_W;
    const rightEdge = canvas.width - MARGIN - PAD_W;

    if (ball.vx < 0 && ball.x <= leftEdge && ball.x >= MARGIN - 6) {
        if (Math.abs(ball.y - leftY) < PADDLE_H / 2) {
            ball.x = leftEdge;
            ball.vx = Math.min(Math.abs(ball.vx) * 1.05 + 0.15, 12);
            ball.vy += (ball.y - leftY) * 0.06;
        }
    }

    if (ball.vx > 0 && ball.x >= rightEdge && ball.x <= canvas.width - MARGIN + 6) {
        if (Math.abs(ball.y - rightY) < PADDLE_H / 2) {
            ball.x = rightEdge;
            ball.vx = -(Math.min(Math.abs(ball.vx) * 1.05 + 0.15, 12));
            ball.vy += (ball.y - rightY) * 0.06;
        }
    }

    if (ball.x < -30) {
        scoreR++;
        afterGoal(1);
    } else if (ball.x > canvas.width + 30) {
        scoreL++;
        afterGoal(-1);
    }
}

function afterGoal(loserDir) {
    if (scoreL >= WIN_SCORE || scoreR >= WIN_SCORE) {
        flashText = scoreL > scoreR ? 'ГОЛУБЫЕ ПОБЕДИЛИ' : 'РОЗОВЫЕ ПОБЕДИЛИ';
        flashTimer = 180;
        scoreL = 0;
        scoreR = 0;
    } else {
        flashTimer = 30;
    }
    serve(loserDir);
}

function drawCourt() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 64px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(78, 205, 196, 0.55)';
    ctx.fillText(scoreL, canvas.width / 2 - 90, 26);
    ctx.fillStyle = 'rgba(255, 107, 157, 0.55)';
    ctx.fillText(scoreR, canvas.width / 2 + 90, 26);

    if (flashTimer > 0 && flashText) {
        ctx.font = 'bold 34px Courier New, monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(flashText, canvas.width / 2, canvas.height / 2 - 80);
    }
}

function draw() {
    update();

    ctx.fillStyle = '#05060e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCourt();

    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(MARGIN, leftY - PADDLE_H / 2, PAD_W, PADDLE_H);

    ctx.fillStyle = '#ff6b9d';
    ctx.fillRect(canvas.width - MARGIN - PAD_W, rightY - PADDLE_H / 2, PAD_W, PADDLE_H);

    ctx.fillStyle = '#fff';
    ctx.fillRect(ball.x - 5, ball.y - 5, 10, 10);

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

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
