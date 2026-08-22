const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let time = 0;

let imageData = null;
let data = null;

function initBuffer() {
    imageData = ctx.createImageData(canvas.width, canvas.height);
    data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
        data[i] = 255;
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBuffer();
}
window.addEventListener('resize', resize);
resize();

const PALETTE_SIZE = 256;
const palette = new Uint8Array(PALETTE_SIZE * 3);

function hslToRgb(h, s, l) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [
        Math.round(hue2rgb(h + 1 / 3) * 255),
        Math.round(hue2rgb(h) * 255),
        Math.round(hue2rgb(h - 1 / 3) * 255)
    ];
}

for (let i = 0; i < PALETTE_SIZE; i++) {
    const rgb = hslToRgb(i / PALETTE_SIZE, 0.8, 0.5);
    palette[i * 3] = rgb[0];
    palette[i * 3 + 1] = rgb[1];
    palette[i * 3 + 2] = rgb[2];
}

function draw() {
    const step = 4;
    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const v1 = Math.sin(x * 0.01 + time * 0.02);
            const v2 = Math.sin(y * 0.01 + time * 0.015);
            const v3 = Math.sin((x + y) * 0.01 + time * 0.01);
            const v4 = Math.sin(Math.sqrt(x * x + y * y) * 0.01 + time * 0.025);

            const v = (v1 + v2 + v3 + v4) / 4;
            let ci = ((v + 1) * 127.5) | 0;
            if (ci > 255) ci = 255;

            const r = palette[ci * 3];
            const g = palette[ci * 3 + 1];
            const b = palette[ci * 3 + 2];

            for (let dy = 0; dy < step && y + dy < canvas.height; dy++) {
                let idx = ((y + dy) * canvas.width + x) * 4;
                for (let dx = 0; dx < step && x + dx < canvas.width; dx++) {
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    idx += 4;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    time++;
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
