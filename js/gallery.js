let allScreensavers = [];
let activeFilters = new Set();
let currentSort = 'name-asc';
let searchQuery = '';
let showFavoritesOnly = false;
const favorites = JSON.parse(localStorage.getItem('screenDreamsFavorites') || '[]');
const activeAnimations = new Map();
const FPS = 15;
const FRAME_TIME = 1000 / FPS;
let tooltip = null;

document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');

    try {
        const response = await fetch('data/screensavers.json');
        const data = await response.json();
        allScreensavers = data.screensavers;
        renderFilters();
        renderGallery(allScreensavers);
        setupEventListeners();
    } catch (error) {
        gallery.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Не удалось загрузить список скринсейверов</p>';
    }
});

function renderFilters() {
    const filtersContainer = document.getElementById('filters');
    const tagCounts = {};

    allScreensavers.forEach(screensaver => {
        screensaver.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        tagCounts[screensaver.technology] = (tagCounts[screensaver.technology] || 0) + 1;
    });

    const sortedTags = Object.keys(tagCounts).sort();

    const categories = {
        '🌌 Космос': ['space', '3d', 'stars', 'galaxy', 'nebula', 'aurora'],
        '🌊 Природа': ['snow', 'rain', 'fire', 'lava', 'ocean', 'lightning', 'bubbles', 'butterfly', 'fireflies'],
        '🎨 Абстракция': ['particles', 'plasma', 'gradient', 'waves', 'circle', 'pulse', 'spiral', 'ripple', 'confetti'],
        '⏰ Часы': ['clock', 'flip', 'moon', 'pixel', 'gravity', 'orbit', 'time'],
        '🔬 Наука': ['dna', 'maze', 'matrix', 'disco'],
        '🔧 Технология': ['canvas2d', 'threejs', 'css', 'html']
    };

    let html = '';

    Object.entries(categories).forEach(([category, tags]) => {
        const availableTags = tags.filter(tag => tagCounts[tag]);
        if (availableTags.length > 0) {
            html += `<span class="filter-category">${category}</span>`;
            availableTags.forEach(tag => {
                html += `<button class="filter-btn" data-tag="${tag}">${tag} <span class="filter-count">${tagCounts[tag]}</span></button>`;
            });
        }
    });

    html += `<button class="filter-reset" id="filterReset">Сбросить все</button>`;
    html += `<button class="filter-favorite ${showFavoritesOnly ? 'active' : ''}" id="filterFavorite">❤️ Избранное</button>`;

    filtersContainer.innerHTML = html;

    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleFilter(btn.dataset.tag));
    });

    document.getElementById('filterReset').addEventListener('click', resetFilters);
    document.getElementById('filterFavorite').addEventListener('click', toggleFavoritesFilter);
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('screenDreamsFavorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.dataset.id;
        const isFavorite = favorites.includes(id);
        btn.classList.toggle('active', isFavorite);
        btn.textContent = isFavorite ? '❤️' : '🤍';
    });
    document.getElementById('filterFavorite').classList.toggle('active', showFavoritesOnly);
}

function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
    document.getElementById('filterFavorite').classList.toggle('active', showFavoritesOnly);
    applyFilters();
}

function showTooltip(e, text) {
    hideTooltip();
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom + 8;

    if (x + 250 > window.innerWidth) {
        x = window.innerWidth - 260;
    }
    if (y + 60 > window.innerHeight) {
        y = rect.top - 60;
    }

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    requestAnimationFrame(() => tooltip.classList.add('visible'));
}

function hideTooltip() {
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
}

function toggleFilter(tag) {
    if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
    } else {
        activeFilters.add(tag);
    }
    updateFilterUI();
    applyFilters();
}

function resetFilters() {
    activeFilters.clear();
    updateFilterUI();
    applyFilters();
}

function updateFilterUI() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', activeFilters.has(btn.dataset.tag));
    });
    document.getElementById('filterReset').classList.toggle('visible', activeFilters.size > 0);
}

function applyFilters() {
    let filtered = allScreensavers;

    if (showFavoritesOnly) {
        filtered = filtered.filter(screensaver => favorites.includes(screensaver.id));
    }

    if (activeFilters.size > 0) {
        filtered = filtered.filter(screensaver => {
            const screensaverTags = [...screensaver.tags, screensaver.technology];
            return [...activeFilters].some(filter => screensaverTags.includes(filter));
        });
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(screensaver =>
            screensaver.name.toLowerCase().includes(query) ||
            screensaver.description.toLowerCase().includes(query) ||
            screensaver.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    filtered = sortScreensavers(filtered);
    renderGallery(filtered);
}

function sortScreensavers(screensavers) {
    const sorted = [...screensavers];
    switch (currentSort) {
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'tech':
            return sorted.sort((a, b) => a.technology.localeCompare(b.technology));
        default:
            return sorted;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            applyFilters();
        }, 300);
    });

    document.getElementById('sort').addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });

    document.getElementById('randomBtn').addEventListener('click', openRandom);
}

function openRandom() {
    const randomIndex = Math.floor(Math.random() * allScreensavers.length);
    window.location.href = allScreensavers[randomIndex].path;
}

function renderGallery(screensavers) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    if (screensavers.length === 0) {
        gallery.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Ничего не найдено</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    screensavers.forEach(screensaver => {
        fragment.appendChild(createCard(screensaver));
    });
    gallery.appendChild(fragment);

    if ('IntersectionObserver' in window) {
        setupLazyLoading();
    }
}

function createCard(screensaver) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-screensaver', screensaver.id);

    const isFavorite = favorites.includes(screensaver.id);

    const tagsHTML = screensaver.tags
        .map(tag => `<span class="card__tag">${tag}</span>`)
        .join('');

    card.innerHTML = `
        <div class="card__preview" id="preview-${screensaver.id}">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${screensaver.id}" title="В избранное">${isFavorite ? '❤️' : '🤍'}</button>
            <span class="card__preview-placeholder">Загрузка...</span>
        </div>
        <div class="card__info">
            <h2 class="card__name" data-tooltip="${screensaver.description}">${screensaver.name}</h2>
            <p class="card__description">${screensaver.description}</p>
            <div class="card__tags">${tagsHTML}</div>
        </div>
    `;

    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(screensaver.id);
    });

    card.addEventListener('mouseenter', () => startPreviewAnimation(screensaver));
    card.addEventListener('mouseleave', () => stopPreviewAnimation(screensaver.id));
    card.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) return;
        stopPreviewAnimation(screensaver.id);
        window.location.href = screensaver.path;
    });

    const nameEl = card.querySelector('.card__name');
    nameEl.addEventListener('mouseenter', (e) => showTooltip(e, screensaver.description));
    nameEl.addEventListener('mouseleave', hideTooltip);

    return card;
}

function setupLazyLoading() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const screensaverId = card.getAttribute('data-screensaver');
                loadPreviewById(screensaverId);
                observer.unobserve(card);
            }
        });
    }, options);

    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

function loadPreviewById(id) {
    const screensaver = allScreensavers.find(s => s.id === id);
    if (screensaver) {
        loadPreview(screensaver);
    }
}

function loadPreview(screensaver) {
    const container = document.getElementById(`preview-${screensaver.id}`);
    if (!container) return;

    if (screensaver.technology === 'css' || screensaver.technology === 'html') {
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
    container._canvas = canvas;
    container._ctx = ctx;
    container._width = rect.width;
    container._height = rect.height;
}

function startPreviewAnimation(screensaver) {
    const container = document.getElementById(`preview-${screensaver.id}`);
    if (!container || !container._canvas) return;

    stopPreviewAnimation(screensaver.id);

    const ctx = container._ctx;
    const w = container._width;
    const h = container._height;
    let lastFrame = 0;
    let time = 0;

    const previewFunctions = {
        matrix: animateMatrix,
        particles: animateParticles,
        snow: animateSnow,
        rain: animateRain,
        fire: animateFire,
        nebula: animateNebula,
        lava: animateLava,
        ocean: animateOcean,
        aurora: animateAurora,
        plasma: animatePlasma,
        dna: animateDNA,
        bubbles: animateBubbles,
        lightning: animateLightning,
        waves: animateWaves,
        fireflies: animateFireflies,
        spiral: animateSpiral,
        asteroid: animateAsteroid,
        firework: animateFirework,
        clock: animateClock,
        butterfly: animateButterfly,
        gravityclock: animateGravityClock,
        orbitclock: animateOrbitClock,
        starclock: animateStarClock,
        analogclock: animateAnalogClock
    };

    const animateFn = previewFunctions[screensaver.id];
    if (!animateFn) return;

    function loop(timestamp) {
        if (timestamp - lastFrame >= FRAME_TIME) {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, w, h);
            animateFn(ctx, w, h, time);
            time++;
            lastFrame = timestamp;
        }
        const animId = requestAnimationFrame(loop);
        activeAnimations.set(screensaver.id, animId);
    }

    const animId = requestAnimationFrame(loop);
    activeAnimations.set(screensaver.id, animId);
}

function stopPreviewAnimation(id) {
    if (activeAnimations.has(id)) {
        cancelAnimationFrame(activeAnimations.get(id));
        activeAnimations.delete(id);
    }
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
        case 'nebula':
            drawNebulaPreview(ctx, w, h);
            break;
        case 'lava':
            drawLavaPreview(ctx, w, h);
            break;
        case 'ocean':
            drawOceanPreview(ctx, w, h);
            break;
        case 'aurora':
            drawAuroraPreview(ctx, w, h);
            break;
        case 'plasma':
            drawPlasmaPreview(ctx, w, h);
            break;
        case 'confetti':
            drawConfettiPreview(ctx, w, h);
            break;
        case 'dna':
            drawDNAPreview(ctx, w, h);
            break;
        case 'bubbles':
            drawBubblesPreview(ctx, w, h);
            break;
        case 'lightning':
            drawLightningPreview(ctx, w, h);
            break;
        case 'waves':
            drawWavesPreview(ctx, w, h);
            break;
        case 'fireflies':
            drawFirefliesPreview(ctx, w, h);
            break;
        case 'ripple':
            drawRipplePreview(ctx, w, h);
            break;
        case 'spiral':
            drawSpiralPreview(ctx, w, h);
            break;
        case 'asteroid':
            drawAsteroidPreview(ctx, w, h);
            break;
        case 'firework':
            drawFireworkPreview(ctx, w, h);
            break;
        case 'clock':
            drawClockPreview(ctx, w, h);
            break;
        case 'butterfly':
            drawButterflyPreview(ctx, w, h);
            break;
        case 'gravityclock':
            drawGravityClockPreview(ctx, w, h);
            break;
        case 'orbitclock':
            drawOrbitClockPreview(ctx, w, h);
            break;
        case 'starclock':
            drawStarClockPreview(ctx, w, h);
            break;
        case 'analogclock':
            drawAnalogClockPreview(ctx, w, h);
            break;
        default:
            drawDefaultPreview(ctx, w, h, id);
    }
}

function drawMatrixPreview(ctx, w, h) {
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789';
    ctx.font = '12px monospace';
    ctx.fillStyle = '#0f0';
    for (let x = 0; x < w; x += 15) {
        const y = Math.random() * h;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.fillText(char, x, y);
    }
    ctx.globalAlpha = 1;
}

function drawParticlesPreview(ctx, w, h) {
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${0.3 + Math.random() * 0.7})`;
        ctx.fill();
    }
}

function drawStarfieldPreview(ctx, w, h) {
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.5;
        const b = Math.floor(150 + Math.random() * 105);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${b},${b},${b})`;
        ctx.fill();
    }
}

function drawSnowPreview(ctx, w, h) {
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.6})`;
        ctx.fill();
    }
}

function drawRainPreview(ctx, w, h) {
    ctx.strokeStyle = 'rgba(150, 180, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = 8 + Math.random() * 15;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 1, y + len);
        ctx.stroke();
    }
}

function drawFirePreview(ctx, w, h) {
    for (let i = 0; i < 150; i++) {
        const x = w * 0.3 + Math.random() * w * 0.4;
        const y = h * 0.3 + Math.random() * h * 0.6;
        const r = 2 + Math.random() * 5;
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

function drawNebulaPreview(ctx, w, h) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 30 + Math.random() * 60;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, colors[i % colors.length] + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function drawLavaPreview(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    gradient.addColorStop(0, '#ff4500');
    gradient.addColorStop(0.5, '#cc0000');
    gradient.addColorStop(1, '#1a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = h * 0.5 + Math.random() * h * 0.5;
        const r = 3 + Math.random() * 8;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        g.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function drawOceanPreview(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#001a33');
    bg.addColorStop(1, '#004080');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.4 + i * 20);
        for (let x = 0; x <= w; x += 5) {
            const y = h * 0.4 + i * 20 + Math.sin(x * 0.02 + i) * 15;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function drawAuroraPreview(ctx, w, h) {
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3 + i * 20);
        for (let x = 0; x <= w; x += 5) {
            const y = h * 0.3 + i * 20 + Math.sin(x * 0.005 + i) * 30;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.6);
        g.addColorStop(0, `rgba(0, 255, 150, ${0.15 - i * 0.03})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function drawPlasmaPreview(ctx, w, h) {
    for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
            const v = Math.sin(x * 0.02) + Math.sin(y * 0.02) + Math.sin((x + y) * 0.01);
            const hue = ((v + 3) / 6) * 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.fillRect(x, y, 4, 4);
        }
    }
}

function drawConfettiPreview(ctx, w, h) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffeaa7', '#fd79a8'];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 3 + Math.random() * 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(-size / 2, -size / 4, size, size / 2);
        ctx.restore();
    }
}

function drawDNAPreview(ctx, w, h) {
    const cx = w / 2;
    for (let i = 0; i < 20; i++) {
        const y = i * (h / 20);
        const x1 = cx + Math.sin(y * 0.05) * 30;
        const x2 = cx + Math.sin(y * 0.05 + Math.PI) * 30;
        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240, 147, 251, 0.8)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsl(${i * 20}, 70%, 60%)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawBubblesPreview(ctx, w, h) {
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 3 + Math.random() * 12;
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, 'rgba(150, 200, 255, 0.5)');
        g.addColorStop(1, 'rgba(100, 150, 200, 0)');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function drawLightningPreview(ctx, w, h) {
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        let x = Math.random() * w;
        let y = 0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        while (y < h) {
            x += (Math.random() - 0.5) * 30;
            y += 10 + Math.random() * 20;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function drawWavesPreview(ctx, w, h) {
    const colors = ['rgba(0, 200, 255, 0.4)', 'rgba(0, 150, 200, 0.3)', 'rgba(0, 100, 150, 0.2)'];
    colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x <= w; x += 2) {
            const y = h / 2 + Math.sin(x * 0.015 + i * 2) * 20 + Math.sin(x * 0.008) * 10;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawFirefliesPreview(ctx, w, h) {
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const alpha = 0.3 + Math.random() * 0.7;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function drawRipplePreview(ctx, w, h) {
    const colors = ['#64c8ff', '#ff64c8', '#64ff64'];
    for (let i = 0; i < 3; i++) {
        const cx = w / 2 + (Math.random() - 0.5) * w * 0.5;
        const cy = h / 2 + (Math.random() - 0.5) * h * 0.5;
        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(cx, cy, 10 + j * 15, 0, Math.PI * 2);
            ctx.strokeStyle = colors[i] + '80';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

function drawSpiralPreview(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 200; i++) {
        const angle = i * 0.1;
        const radius = i * 0.4;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const hue = i % 360;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fill();
    }
}

function drawAsteroidPreview(ctx, w, h) {
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 5 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawFireworkPreview(ctx, w, h) {
    const colors = ['#ff0066', '#00ff66', '#ffff00', '#00ffff', '#ff6600'];
    for (let i = 0; i < 3; i++) {
        const cx = w * 0.2 + Math.random() * w * 0.6;
        const cy = h * 0.2 + Math.random() * h * 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let j = 0; j < 20; j++) {
            const angle = (j / 20) * Math.PI * 2;
            const r = 10 + Math.random() * 20;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}

function drawClockPreview(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const now = new Date();
    const secAngle = (now.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secAngle) * r * 0.9, cy + Math.sin(secAngle) * r * 0.9);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawButterflyPreview(ctx, w, h) {
    const colors = ['#ff96c8', '#96c8ff', '#c8ff96', '#ffc896'];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 5 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(-size * 0.4, 0, size, size * 0.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.4, 0, size, size * 0.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawGravityClockPreview(ctx, w, h) {
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    ctx.fillStyle = '#ff6496';
    ctx.fillText(time, w / 2, h / 2);
}

function drawOrbitClockPreview(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
    sun.addColorStop(0, '#ffd700');
    sun.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = sun;
    ctx.fill();
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
    const radii = [25, 40, 55];
    colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        const angle = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * radii[i], cy + Math.sin(angle) * radii[i], 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });
}

function drawStarClockPreview(ctx, w, h) {
    const timeStr = String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 200, 50, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 200, 50, 0.5)';
    ctx.fillText(timeStr, w / 2, h / 2);
    ctx.shadowBlur = 0;
}

function drawAnalogClockPreview(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180, 140, 80, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const now = new Date();
    const secAngle = (now.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secAngle) * r * 0.9, cy + Math.sin(secAngle) * r * 0.9);
    ctx.strokeStyle = '#cc3333';
    ctx.lineWidth = 1;
    ctx.stroke();
    const minAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minAngle) * r * 0.7, cy + Math.sin(minAngle) * r * 0.7);
    ctx.strokeStyle = 'rgba(200, 180, 120, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawDefaultPreview(ctx, w, h, id) {
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(id, w / 2, h / 2);
}

function animateMatrix(ctx, w, h, t) {
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789';
    ctx.font = '12px monospace';
    ctx.fillStyle = '#0f0';
    for (let x = 0; x < w; x += 15) {
        const y = ((t * 2 + x * 0.5) % (h + 20)) - 10;
        const char = chars[Math.floor((x + t) % chars.length)];
        ctx.globalAlpha = 0.4 + Math.sin(t * 0.1 + x * 0.1) * 0.3;
        ctx.fillText(char, x, y);
    }
    ctx.globalAlpha = 1;
}

function animateParticles(ctx, w, h, t) {
    for (let i = 0; i < 40; i++) {
        const x = (Math.sin(t * 0.02 + i * 0.5) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.015 + i * 0.7) * 0.5 + 0.5) * h;
        const r = 1.5 + Math.sin(t * 0.05 + i) * 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${0.4 + Math.sin(t * 0.1 + i) * 0.3})`;
        ctx.fill();
    }
}

function animateSnow(ctx, w, h, t) {
    for (let i = 0; i < 50; i++) {
        const x = (i * 13 + t * 0.5 + Math.sin(t * 0.02 + i) * 10) % w;
        const y = (i * 17 + t * 1.5) % h;
        const r = 1 + Math.sin(i) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(t * 0.05 + i) * 0.3})`;
        ctx.fill();
    }
}

function animateRain(ctx, w, h, t) {
    ctx.strokeStyle = 'rgba(150, 180, 255, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
        const x = (i * 11 + 5) % w;
        const y = (i * 7 + t * 3) % (h + 20) - 10;
        const len = 8 + (i % 5) * 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 1, y + len);
        ctx.stroke();
    }
}

function animateFire(ctx, w, h, t) {
    for (let i = 0; i < 60; i++) {
        const x = w * 0.3 + Math.sin(t * 0.05 + i * 0.3) * w * 0.15 + Math.random() * w * 0.1;
        const y = h - (i * 3 + t * 2) % (h * 0.7);
        const r = 2 + Math.sin(t * 0.1 + i) * 2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255, ${150 + i * 2}, 50, ${0.8 - i * 0.01})`);
        g.addColorStop(1, 'rgba(200, 20, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateNebula(ctx, w, h, t) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    for (let i = 0; i < 5; i++) {
        const x = w * 0.5 + Math.sin(t * 0.01 + i * 1.5) * w * 0.3;
        const y = h * 0.5 + Math.cos(t * 0.008 + i * 1.2) * h * 0.3;
        const r = 40 + Math.sin(t * 0.02 + i) * 15;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, colors[i] + '50');
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateLava(ctx, w, h, t) {
    const bg = ctx.createLinearGradient(0, h, 0, 0);
    bg.addColorStop(0, '#ff4500');
    bg.addColorStop(0.5, '#cc0000');
    bg.addColorStop(1, '#1a0000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 20; i++) {
        const x = (i * 17 + Math.sin(t * 0.03 + i) * 20) % w;
        const y = h * 0.5 + Math.sin(t * 0.02 + i * 0.5) * h * 0.3;
        const r = 4 + Math.sin(t * 0.05 + i) * 3;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
        g.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateOcean(ctx, w, h, t) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#001a33');
    bg.addColorStop(1, '#004080');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.4 + i * 15);
        for (let x = 0; x <= w; x += 3) {
            const y = h * 0.4 + i * 15 + Math.sin(x * 0.02 + t * 0.03 + i) * 12;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0, ${150 + i * 20}, 255, ${0.4 - i * 0.08})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function animateAurora(ctx, w, h, t) {
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3 + i * 15);
        for (let x = 0; x <= w; x += 3) {
            const y = h * 0.3 + i * 15 + Math.sin(x * 0.005 + t * 0.02 + i * 0.8) * 25;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.6);
        g.addColorStop(0, `rgba(0, 255, 150, ${0.12 - i * 0.02})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animatePlasma(ctx, w, h, t) {
    for (let y = 0; y < h; y += 6) {
        for (let x = 0; x < w; x += 6) {
            const v = Math.sin(x * 0.015 + t * 0.03) + Math.sin(y * 0.015 + t * 0.02) + Math.sin((x + y) * 0.008 + t * 0.01);
            const hue = ((v + 3) / 6 * 360 + t * 2) % 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.fillRect(x, y, 6, 6);
        }
    }
}

function animateDNA(ctx, w, h, t) {
    const cx = w / 2;
    for (let i = 0; i < 25; i++) {
        const y = i * (h / 25);
        const x1 = cx + Math.sin(y * 0.04 + t * 0.03) * 25;
        const x2 = cx + Math.sin(y * 0.04 + t * 0.03 + Math.PI) * 25;
        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240, 147, 251, 0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsl(${(i * 15 + t) % 360}, 70%, 60%)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function animateBubbles(ctx, w, h, t) {
    for (let i = 0; i < 20; i++) {
        const x = (i * 19 + Math.sin(t * 0.02 + i * 0.5) * 15) % w;
        const y = h - (i * 13 + t * 1) % (h + 30);
        const r = 3 + Math.sin(i) * 4;
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, 'rgba(150, 200, 255, 0.5)');
        g.addColorStop(1, 'rgba(100, 150, 200, 0)');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateLightning(ctx, w, h, t) {
    if (t % 30 < 3) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 2; i++) {
            let x = Math.random() * w;
            let y = 0;
            ctx.beginPath();
            ctx.moveTo(x, y);
            while (y < h) {
                x += (Math.random() - 0.5) * 25;
                y += 8 + Math.random() * 15;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
}

function animateWaves(ctx, w, h, t) {
    const colors = ['rgba(0, 200, 255, 0.5)', 'rgba(0, 150, 200, 0.4)', 'rgba(0, 100, 150, 0.3)'];
    colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x <= w; x += 3) {
            const y = h / 2 + Math.sin(x * 0.015 + t * 0.03 + i * 2) * 18 + Math.sin(x * 0.008 + t * 0.02) * 8;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function animateFireflies(ctx, w, h, t) {
    for (let i = 0; i < 15; i++) {
        const x = (Math.sin(t * 0.01 + i * 0.8) * 0.4 + 0.5) * w;
        const y = (Math.cos(t * 0.008 + i * 1.1) * 0.4 + 0.5) * h;
        const alpha = 0.3 + Math.sin(t * 0.05 + i * 1.5) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateSpiral(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 150; i++) {
        const angle = i * 0.12 + t * 0.02;
        const radius = i * 0.35;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const hue = (i + t * 2) % 360;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fill();
    }
}

function animateAsteroid(ctx, w, h, t) {
    for (let i = 0; i < 10; i++) {
        const x = (i * 31 + t * 0.3) % (w + 20) - 10;
        const y = (i * 23 + Math.sin(t * 0.02 + i) * 10) % h;
        const size = 4 + (i % 3) * 4;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function animateFirework(ctx, w, h, t) {
    if (t % 40 === 0) {
        const colors = ['#ff0066', '#00ff66', '#ffff00', '#00ffff', '#ff6600'];
        const cx = w * 0.2 + Math.random() * w * 0.6;
        const cy = h * 0.2 + Math.random() * h * 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let j = 0; j < 15; j++) {
            const angle = (j / 15) * Math.PI * 2;
            const r = 5 + Math.random() * 15;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}

function animateClock(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const secAngle = (t * 0.05) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secAngle) * r * 0.9, cy + Math.sin(secAngle) * r * 0.9);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    const minAngle = (t * 0.001) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minAngle) * r * 0.7, cy + Math.sin(minAngle) * r * 0.7);
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animateButterfly(ctx, w, h, t) {
    const colors = ['#ff96c8', '#96c8ff', '#c8ff96', '#ffc896'];
    for (let i = 0; i < 6; i++) {
        const x = (Math.sin(t * 0.015 + i * 1.2) * 0.3 + 0.5) * w;
        const y = (Math.cos(t * 0.012 + i * 0.9) * 0.3 + 0.5) * h;
        const size = 5 + Math.sin(i) * 3;
        const color = colors[i % colors.length];
        const wingAngle = Math.sin(t * 0.15 + i) * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(-size * 0.4, 0, size, size * 0.5, -0.3 + wingAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.4, 0, size, size * 0.5, 0.3 - wingAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function animateGravityClock(ctx, w, h, t) {
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const y = Math.min(h * 0.5 + Math.sin(t * 0.1) * 5, h * 0.5);
    ctx.fillStyle = '#ff6496';
    ctx.fillText(time, w / 2, y);
}

function animateOrbitClock(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
    sun.addColorStop(0, '#ffd700');
    sun.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = sun;
    ctx.fill();
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
    const radii = [18, 30, 42];
    colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        const angle = t * 0.03 * (3 - i);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * radii[i], cy + Math.sin(angle) * radii[i], 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });
}

function animateStarClock(ctx, w, h, t) {
    const timeStr = String(new Date().getHours()).padStart(2, '0') + String(new Date().getMinutes()).padStart(2, '0');
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    for (let i = 0; i < timeStr.length; i++) {
        const x = (i + 0.5) * (w / timeStr.length);
        const pulse = 0.5 + Math.sin(t * 0.1 + i) * 0.5;
        ctx.fillStyle = `rgba(255, 200, 50, ${pulse})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 200, 50, ${pulse})`;
        ctx.fillText(timeStr[i], x, h / 2);
    }
    ctx.shadowBlur = 0;
}

function animateAnalogClock(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.4;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180, 140, 80, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const now = new Date();
    const secAngle = (now.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secAngle) * r * 0.9, cy + Math.sin(secAngle) * r * 0.9);
    ctx.strokeStyle = '#cc3333';
    ctx.lineWidth = 1;
    ctx.stroke();

    const minAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minAngle) * r * 0.7, cy + Math.sin(minAngle) * r * 0.7);
    ctx.strokeStyle = 'rgba(200, 180, 120, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const hourAngle = ((now.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourAngle) * r * 0.5, cy + Math.sin(hourAngle) * r * 0.5);
    ctx.strokeStyle = 'rgba(180, 140, 80, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
}
