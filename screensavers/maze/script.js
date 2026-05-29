const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const cellSize = 20;
let cols, rows;
let maze = [];
let stack = [];
let current;
let generationComplete = false;
let pathTrail = [];
let time = 0;

function init() {
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    maze = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze.push({
                x, y,
                walls: [true, true, true, true],
                visited: false
            });
        }
    }

    current = maze[0];
    current.visited = true;
    stack = [current];
    generationComplete = false;
    pathTrail = [];
}

function getCell(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
    return maze[y * cols + x];
}

function getUnvisitedNeighbor(cell) {
    const neighbors = [];
    const top = getCell(cell.x, cell.y - 1);
    const right = getCell(cell.x + 1, cell.y);
    const bottom = getCell(cell.x, cell.y + 1);
    const left = getCell(cell.x - 1, cell.y);

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    return null;
}

function removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) { a.walls[3] = false; b.walls[1] = false; }
    if (dx === -1) { a.walls[1] = false; b.walls[3] = false; }
    if (dy === 1) { a.walls[0] = false; b.walls[2] = false; }
    if (dy === -1) { a.walls[2] = false; b.walls[0] = false; }
}

function generateMaze() {
    if (stack.length > 0) {
        const next = getUnvisitedNeighbor(current);
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    } else {
        generationComplete = true;
        pathTrail = [];
        animatePath();
    }
}

function animatePath() {
    if (pathTrail.length < maze.length) {
        const unvisited = maze.filter(c => !pathTrail.includes(c));
        if (unvisited.length > 0) {
            pathTrail.push(unvisited[0]);
            setTimeout(animatePath, 10);
        }
    } else {
        setTimeout(() => {
            pathTrail = [];
            init();
        }, 3000);
    }
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!generationComplete) {
        generateMaze();
    }

    maze.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;

        if (cell.visited) {
            ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        ctx.lineWidth = 1;

        if (cell.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
        if (cell.walls[1]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
        if (cell.walls[2]) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
        if (cell.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
    });

    if (!generationComplete) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(current.x * cellSize + 2, current.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }

    pathTrail.forEach((cell, i) => {
        const alpha = 1 - (i / pathTrail.length);
        ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
        ctx.fillRect(cell.x * cellSize + 2, cell.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    time++;
    requestAnimationFrame(draw);
}

init();
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
