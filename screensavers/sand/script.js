const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL = 4;
const PALETTE = ['#e8cf96', '#cfae74', '#b08c55'];
let cols, rows, grid;
let frame = 0;
let emitterX, emitterTimer;
const mouse = { x: -1, y: -1, down: false };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
}
window.addEventListener('resize', resize);
resize();

function initGrid() {
    cols = Math.max(1, Math.floor(canvas.width / CELL));
    rows = Math.max(1, Math.floor(canvas.height / CELL));
    grid = new Uint8Array(cols * rows);

    for (let p = 0; p < 3; p++) {
        const cx = Math.floor(cols * (0.22 + 0.28 * p));
        const pileH = Math.floor(rows * (0.3 + Math.random() * 0.15));
        for (let h = 0; h < pileH; h++) {
            const half = Math.floor(h * 0.5) + 1;
            for (let dx = -half; dx <= half; dx++) {
                const x = cx + dx;
                if (x < 0 || x >= cols) continue;
                grid[(rows - 1 - h) * cols + x] = 1 + (Math.random() * 3 | 0);
            }
        }
    }

    emitterX = Math.floor(cols * Math.random());
    emitterTimer = 0;
}

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener('mousedown', () => { mouse.down = true; });
window.addEventListener('mouseup', () => { mouse.down = false; });
canvas.addEventListener('mouseleave', () => { mouse.x = -1; mouse.y = -1; });

function pourAt(cx, cy, radius, density) {
    const gx = Math.floor(cx / CELL);
    const gy = Math.floor(cy / CELL);
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy > radius * radius) continue;
            if (Math.random() > density) continue;
            const x = gx + dx;
            const y = gy + dy;
            if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
            const idx = y * cols + x;
            if (!grid[idx]) {
                grid[idx] = 1 + (Math.random() * 3 | 0);
            }
        }
    }
}

function stepSand() {
    for (let y = rows - 2; y >= 0; y--) {
        const ltr = (frame + y) % 2 === 0;
        for (let i = 0; i < cols; i++) {
            const x = ltr ? i : cols - 1 - i;
            const idx = y * cols + x;
            const val = grid[idx];
            if (!val) continue;

            const below = idx + cols;
            if (!grid[below]) {
                grid[below] = val;
                grid[idx] = 0;
                continue;
            }

            const firstDir = Math.random() < 0.5 ? 1 : -1;
            let moved = false;

            for (const d of [firstDir, -firstDir]) {
                const nx = x + d;
                if (nx < 0 || nx >= cols) continue;
                const diag = below + d;
                if (!grid[diag]) {
                    grid[diag] = val;
                    grid[idx] = 0;
                    moved = true;
                    break;
                }
            }
            if (moved) continue;
        }
    }
}

function draw() {
    frame++;

    if (mouse.down && mouse.x >= 0) {
        pourAt(mouse.x, mouse.y, 3, 0.6);
    }

    emitterTimer++;
    if (emitterTimer > 240) {
        emitterTimer = 0;
        emitterX = Math.floor(cols * (0.15 + Math.random() * 0.7));
    }
    pourAt(emitterX * CELL, CELL, 1, 0.5);

    stepSand();

    ctx.fillStyle = '#151009';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        const py = y * CELL;
        const rowOff = y * cols;
        for (let x = 0; x < cols; x++) {
            const val = grid[rowOff + x];
            if (val) {
                ctx.fillStyle = PALETTE[val - 1];
                ctx.fillRect(x * CELL, py, CELL, CELL);
            }
        }
    }

    if (frame < 420) {
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(232, 207, 150, 0.5)';
        ctx.fillText('зажми кнопку мыши, чтобы сыпать песок', canvas.width / 2, 70);
    }

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
