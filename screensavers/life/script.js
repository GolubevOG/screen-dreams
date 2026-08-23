const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL = 8;
const STEP_FRAMES = 7;

let cols, rows, grid, next, age;
let frame = 0;
let generation = 0;

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
    next = new Uint8Array(cols * rows);
    age = new Uint8Array(cols * rows);

    for (let i = 0; i < grid.length; i++) {
        if (Math.random() < 0.14) {
            grid[i] = 1;
            age[i] = 1;
        }
    }
    generation = 0;
}

function countNeighbors(x, y) {
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) {
        const yy = (y + dy + rows) % rows;
        const rowOff = yy * cols;
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const xx = (x + dx + cols) % cols;
            n += grid[rowOff + xx];
        }
    }
    return n;
}

function step() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            const alive = grid[idx];
            const n = countNeighbors(x, y);

            next[idx] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);

            if (next[idx]) {
                age[idx] = alive ? Math.min(250, age[idx] + 1) : 1;
            } else {
                age[idx] = 0;
            }
        }
    }

    const tmp = grid;
    grid = next;
    next = tmp;
    generation++;
}

function cellColor(a) {
    if (a <= 1) return 'rgb(190, 255, 170)';
    const k = Math.min(60, a) / 60;
    const r = Math.round(190 - 150 * k);
    const g = Math.round(255 - 40 * k);
    const b = Math.round(170 + 70 * k);
    return `rgb(${r}, ${g}, ${b})`;
}

function draw() {
    ctx.fillStyle = '#04120a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frame++;
    if (frame % STEP_FRAMES === 0) {
        step();
    }

    for (let y = 0; y < rows; y++) {
        const py = y * CELL;
        for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            if (grid[idx]) {
                ctx.fillStyle = cellColor(age[idx]);
                ctx.fillRect(x * CELL, py, CELL - 1, CELL - 1);
            }
        }
    }

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(160, 255, 180, 0.35)';
    ctx.fillText('поколение: ' + generation, 16, canvas.height - 14);

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
