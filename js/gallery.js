document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');

    try {
        const response = await fetch('data/screensavers.json');
        const data = await response.json();
        renderGallery(data.screensavers);
    } catch (error) {
        gallery.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Не удалось загрузить список скринсейверов</p>';
    }
});

function renderGallery(screensavers) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = screensavers.map(screensaver => createCard(screensaver)).join('');
}

function createCard(screensaver) {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => {
        window.location.href = screensaver.path;
    };

    const tagsHTML = screensaver.tags
        .map(tag => `<span class="card__tag">${tag}</span>`)
        .join('');

    card.innerHTML = `
        <div class="card__preview" id="preview-${screensaver.id}">
            <span class="card__preview-placeholder">Загрузка...</span>
        </div>
        <div class="card__info">
            <h2 class="card__name">${screensaver.name}</h2>
            <p class="card__description">${screensaver.description}</p>
            <div class="card__tags">${tagsHTML}</div>
        </div>
    `;

    setTimeout(() => loadPreview(screensaver), 100);

    return card;
}

function loadPreview(screensaver) {
    const container = document.getElementById(`preview-${screensaver.id}`);
    if (!container) return;

    if (screensaver.technology === 'css') {
        loadCSSPreview(container, screensaver);
    } else {
        loadCanvasPreview(container, screensaver);
    }
}

function loadCSSPreview(container, screensaver) {
    const iframe = document.createElement('iframe');
    iframe.src = screensaver.path + 'index.html';
    iframe.style.cssText = 'width:100%;height:100%;border:none;pointer-events:none;';
    iframe.loading = 'lazy';
    container.innerHTML = '';
    container.appendChild(iframe);
}

function loadCanvasPreview(container, screensaver) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    container.innerHTML = '';
    container.appendChild(canvas);

    drawPreview(ctx, rect.width, rect.height, screensaver.id);
}

function drawPreview(ctx, w, h, id) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    switch (id) {
        case 'matrix':
            drawMatrixPreview(ctx, w, h);
            break;
        case 'particles':
            drawParticlesPreview(ctx, w, h);
            break;
        case 'starfield':
            drawStarfieldPreview(ctx, w, h);
            break;
        case 'snow':
            drawSnowPreview(ctx, w, h);
            break;
        case 'rain':
            drawRainPreview(ctx, w, h);
            break;
        case 'fire':
            drawFirePreview(ctx, w, h);
            break;
        default:
            drawDefaultPreview(ctx, w, h, id);
    }
}

function drawMatrixPreview(ctx, w, h) {
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#0f0';

    for (let x = 0; x < w; x += 18) {
        const y = Math.random() * h;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.fillText(char, x, y);
    }
    ctx.globalAlpha = 1;
}

function drawParticlesPreview(ctx, w, h) {
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 3;
        const alpha = 0.3 + Math.random() * 0.7;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
        ctx.fill();
    }
}

function drawStarfieldPreview(ctx, w, h) {
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2;
        const brightness = Math.floor(150 + Math.random() * 105);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
        ctx.fill();
    }
}

function drawSnowPreview(ctx, w, h) {
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 3;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.6})`;
        ctx.fill();
    }
}

function drawRainPreview(ctx, w, h) {
    ctx.strokeStyle = 'rgba(150, 180, 255, 0.4)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = 10 + Math.random() * 20;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 1, y + len);
        ctx.stroke();
    }
}

function drawFirePreview(ctx, w, h) {
    for (let i = 0; i < 200; i++) {
        const x = w * 0.3 + Math.random() * w * 0.4;
        const y = h * 0.3 + Math.random() * h * 0.6;
        const r = 2 + Math.random() * 6;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);

        gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(200, 20, 0, 0)');

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function drawDefaultPreview(ctx, w, h, id) {
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(id, w / 2, h / 2);
}
