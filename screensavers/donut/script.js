const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CHARS = '.,-~:;=!*#@';
const FONT_SIZE = 13;
const CHAR_W = FONT_SIZE * 0.62;
const THETA_STEP = 0.07;
const PHI_STEP = 0.02;

let cols, rows, zbuf, output;
let A = 0.6;
let B = 0.2;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.font = FONT_SIZE + 'px monospace';
    ctx.textBaseline = 'top';

    cols = Math.max(24, Math.floor(canvas.width / CHAR_W));
    rows = Math.max(16, Math.floor(canvas.height / FONT_SIZE));

    zbuf = new Float32Array(cols * rows);
    output = new Array(cols * rows).fill(' ');
}
window.addEventListener('resize', () => {
    resize();
});
resize();

function project(theta, phi) {
    const cosTheta = Math.cos(theta), sinTheta = Math.sin(theta);
    const circleX = 2 + cosTheta;
    const circleY = sinTheta;

    const px = circleX * Math.cos(phi);
    const py = circleX * Math.sin(phi);
    const pz = circleY;

    const cosA = Math.cos(A), sinA = Math.sin(A);
    const y1 = py * cosA - pz * sinA;
    const z1 = py * sinA + pz * cosA;

    const cosB = Math.cos(B), sinB = Math.sin(B);
    const x2 = px * cosB + z1 * sinB;
    const z2 = -px * sinB + z1 * cosB;

    const depth = z2 + 5;
    const ooz = 1 / depth;
    const k1 = cols * 5 * 3 / 24;

    const nx = cosTheta * Math.cos(phi);
    const ny = cosTheta * Math.sin(phi);
    const nz = sinTheta;

    const ny1 = ny * cosA - nz * sinA;
    const nz1 = ny * sinA + nz * cosA;
    const nx2 = nx * cosB + nz1 * sinB;
    const nz2 = -nx * sinB + nz1 * cosB;

    const lum = ny1 - nz2;
    let idx = Math.round(((lum + 1.4) / 2.8) * (CHARS.length - 1));
    if (idx < 0) idx = 0;
    if (idx > CHARS.length - 1) idx = CHARS.length - 1;

    return {
        x: cols / 2 + k1 * ooz * x2,
        y: rows / 2 - k1 * ooz * y1 * 0.5,
        ooz,
        idx
    };
}

function render() {
    zbuf.fill(0);
    output.fill(' ');

    for (let theta = 0; theta < 6.28; theta += THETA_STEP) {
        for (let phi = 0; phi < 6.28; phi += PHI_STEP) {
            const p = project(theta, phi);

            const xi = Math.round(p.x);
            const yi = Math.round(p.y);
            if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) continue;

            const cellIdx = yi * cols + xi;
            if (p.ooz > zbuf[cellIdx]) {
                zbuf[cellIdx] = p.ooz;
                output[cellIdx] = CHARS[p.idx];
            }
        }
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        const rowOff = y * cols;
        for (let x = 0; x < cols; x++) {
            const ch = output[rowOff + x];
            if (ch === ' ') continue;
            const idx = CHARS.indexOf(ch);
            ctx.fillStyle = `rgb(${40 + idx * 16}, ${170 + idx * 7}, ${90})`;
            ctx.fillText(ch, x * CHAR_W, y * FONT_SIZE);
        }
    }

    A += 0.04;
    B += 0.015;

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

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
