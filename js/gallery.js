let allScreensavers = [];
let activeFilters = new Set(JSON.parse(localStorage.getItem('screenDreamsFilters') || '[]'));
let currentSort = localStorage.getItem('screenDreamsSort') || 'name-asc';
let searchQuery = localStorage.getItem('screenDreamsSearch') || '';
let showFavoritesOnly = localStorage.getItem('screenDreamsFavoritesOnly') === 'true';
let favorites = JSON.parse(localStorage.getItem('screenDreamsFavorites') || '[]');
const activeAnimations = new Map();
let cardObserver = null;
const FPS = 15;
const FRAME_TIME = 1000 / FPS;
let tooltip = null;

const CATEGORY_TAG_MAP = {
    '🌌 Космос': ['space', '3d', 'stars', 'galaxy', 'nebula', 'aurora', 'asteroid', 'meteor'],
    '🌊 Природа': ['snow', 'rain', 'fire', 'lava', 'ocean', 'lightning', 'bubbles', 'butterfly', 'fireflies', 'forest', 'waterfall', 'thunder', 'sakura'],
    '🎨 Абстракция': ['particles', 'plasma', 'gradient', 'waves', 'circle', 'pulse', 'spiral', 'ripple', 'confetti', 'neon', 'geometric', 'retro', 'crystal'],
    '⏰ Часы': ['clock', 'flip', 'moon', 'pixel', 'gravity', 'orbit', 'time', 'analog', 'star'],
    '🔬 Интерактив': ['interactive', 'mouse', 'click', 'maze', 'disco', 'firework', 'pendulum']
};

document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');

    try {
        const response = await fetch('data/screensavers.json');
        const data = await response.json();
        allScreensavers = data.screensavers;
        renderFilters();
        renderGallery(allScreensavers);
        setupEventListeners();
        restoreScrollPosition();
    } catch (error) {
        gallery.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Не удалось загрузить список скринсейверов</p>';
    }
});

function restoreScrollPosition() {
    const savedScroll = localStorage.getItem('screenDreamsScrollPosition');
    if (savedScroll) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll));
        }, 100);
    }
    updateFilterUI();
}

function saveScrollPosition() {
    localStorage.setItem('screenDreamsScrollPosition', window.scrollY);
}

function renderFilters() {
    const filtersContainer = document.getElementById('filters');

    const categoryCounts = {};
    Object.entries(CATEGORY_TAG_MAP).forEach(([category, tags]) => {
        let count = 0;
        allScreensavers.forEach(screensaver => {
            if (tags.some(tag => screensaver.tags.includes(tag))) {
                count++;
            }
        });
        if (count > 0) {
            categoryCounts[category] = count;
        }
    });

    let html = '';

    Object.entries(categoryCounts).forEach(([category, count]) => {
        html += `<button class="filter-btn" data-category="${category}">${category} <span class="filter-count">${count}</span></button>`;
    });

    html += `<button class="filter-reset" id="filterReset">Сбросить</button>`;
    html += `<button class="filter-favorite ${showFavoritesOnly ? 'active' : ''}" id="filterFavorite">❤️ Избранное</button>`;

    filtersContainer.innerHTML = html;

    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleFilter(btn.dataset.category));
    });

    document.getElementById('filterReset').addEventListener('click', resetFilters);
    document.getElementById('filterFavorite').addEventListener('click', toggleFavoritesFilter);
    updateFilterUI();
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
    localStorage.setItem('screenDreamsFavoritesOnly', showFavoritesOnly);
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
    localStorage.setItem('screenDreamsFilters', JSON.stringify([...activeFilters]));
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
        btn.classList.toggle('active', activeFilters.has(btn.dataset.category));
    });
    const filterFavorite = document.getElementById('filterFavorite');
    if (filterFavorite) {
        filterFavorite.classList.toggle('active', showFavoritesOnly);
    }
    const filterReset = document.getElementById('filterReset');
    if (filterReset) {
        filterReset.classList.toggle('visible', activeFilters.size > 0);
    }
}

function applyFilters() {
    let filtered = allScreensavers;

    if (showFavoritesOnly) {
        filtered = filtered.filter(screensaver => favorites.includes(screensaver.id));
    }

    if (activeFilters.size > 0) {
        filtered = filtered.filter(screensaver => {
            return [...activeFilters].some(category => {
                const tags = CATEGORY_TAG_MAP[category] || [];
                return tags.some(tag => screensaver.tags.includes(tag));
            });
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
    searchInput.value = searchQuery;
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            localStorage.setItem('screenDreamsSearch', searchQuery);
            applyFilters();
        }, 300);
    });

    const sortSelect = document.getElementById('sort');
    sortSelect.value = currentSort;
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        localStorage.setItem('screenDreamsSort', currentSort);
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

    activeAnimations.forEach(animId => cancelAnimationFrame(animId));
    activeAnimations.clear();

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
        saveScrollPosition();
        window.location.href = screensaver.path;
    });

    const nameEl = card.querySelector('.card__name');
    nameEl.addEventListener('mouseenter', (e) => showTooltip(e, screensaver.description));
    nameEl.addEventListener('mouseleave', hideTooltip);

    return card;
}

function setupLazyLoading() {
    if (cardObserver) {
        cardObserver.disconnect();
    }

    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const screensaverId = card.getAttribute('data-screensaver');

            if (entry.isIntersecting) {
                if (!card.dataset.loaded) {
                    card.dataset.loaded = 'true';
                    loadPreviewById(screensaverId);
                } else if (card.dataset.previewType === 'iframe') {
                    const screensaver = allScreensavers.find(s => s.id === screensaverId);
                    const container = document.getElementById(`preview-${screensaverId}`);
                    if (screensaver && container && !container.querySelector('iframe')) {
                        loadCSSPreview(container, screensaver);
                    }
                }
            } else if (card.dataset.loaded && card.dataset.previewType === 'iframe') {
                const container = document.getElementById(`preview-${screensaverId}`);
                if (container) {
                    container.innerHTML = '<span class="card__preview-placeholder">Загрузка...</span>';
                }
            }
        });
    }, options);

    document.querySelectorAll('.card').forEach(card => {
        cardObserver.observe(card);
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

    const card = container.closest('.card');
    const isDomBased = screensaver.technology === 'css' || screensaver.technology === 'html';
    if (card) {
        card.dataset.previewType = isDomBased ? 'iframe' : 'canvas';
    }

    if (isDomBased) {
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

const PREVIEW_FUNCTIONS = {
    matrix: animateMatrix,
    particles: animateParticles,
    starfield: animateStarfield,
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
    analogclock: animateAnalogClock,
    forest: animateForest,
    meteor: animateMeteor,
    waterfall: animateWaterfall,
    neon: animateNeon,
    geometric: animateGeometric,
    pendulum: animatePendulum,
    retro: animateRetro,
    crystal: animateCrystal,
    thunder: animateThunder,
    sakura: animateSakura,
    dvd: animateDvd,
    pipes: animatePipes,
    mystify: animateMystify,
    boids: animateBoids,
    life: animateLife,
    sand: animateSand,
    flowfield: animateFlowfield,
    donut: animateDonut,
    fractaltree: animateFractalTree
};

function startPreviewAnimation(screensaver) {
    const container = document.getElementById(`preview-${screensaver.id}`);
    if (!container || !container._canvas) return;

    stopPreviewAnimation(screensaver.id);

    const ctx = container._ctx;
    const w = container._width;
    const h = container._height;
    let lastFrame = 0;
    let time = 0;

    const animateFn = PREVIEW_FUNCTIONS[screensaver.id];
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
        case 'forest':
            drawForestPreview(ctx, w, h);
            break;
        case 'meteor':
            drawMeteorPreview(ctx, w, h);
            break;
        case 'waterfall':
            drawWaterfallPreview(ctx, w, h);
            break;
        case 'neon':
            drawNeonPreview(ctx, w, h);
            break;
        case 'geometric':
            drawGeometricPreview(ctx, w, h);
            break;
        case 'pendulum':
            drawPendulumPreview(ctx, w, h);
            break;
        case 'retro':
            drawRetroPreview(ctx, w, h);
            break;
        case 'crystal':
            drawCrystalPreview(ctx, w, h);
            break;
        case 'thunder':
            drawThunderPreview(ctx, w, h);
            break;
        case 'sakura':
            drawSakuraPreview(ctx, w, h);
            break;
        case 'dvd':
            drawDvdPreview(ctx, w, h);
            break;
        case 'pipes':
            drawPipesPreview(ctx, w, h);
            break;
        case 'mystify':
            drawMystifyPreview(ctx, w, h);
            break;
        case 'boids':
            drawBoidsPreview(ctx, w, h);
            break;
        case 'life':
            drawLifePreview(ctx, w, h);
            break;
        case 'sand':
            drawSandPreview(ctx, w, h);
            break;
        case 'flowfield':
            drawFlowfieldPreview(ctx, w, h);
            break;
        case 'donut':
            drawDonutPreview(ctx, w, h);
            break;
        case 'fractaltree':
            drawFractalTreePreview(ctx, w, h);
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

function drawForestPreview(ctx, w, h) {
    const groundY = h * 0.85;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, groundY, w, h - groundY);
    for (let i = 0; i < 12; i++) {
        const x = (i / 12) * w + Math.random() * 30;
        const th = 40 + Math.random() * 80;
        const tw = 15 + Math.random() * 25;
        ctx.fillStyle = `rgb(${10 + Math.random() * 20}, ${40 + Math.random() * 30}, ${15 + Math.random() * 15})`;
        ctx.beginPath();
        ctx.moveTo(x, groundY - th);
        ctx.lineTo(x - tw / 2, groundY);
        ctx.lineTo(x + tw / 2, groundY);
        ctx.closePath();
        ctx.fill();
    }
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * w;
        const y = groundY - 30 - Math.random() * 80;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
        g.addColorStop(0, 'rgba(255, 255, 100, 0.6)');
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function drawMeteorPreview(ctx, w, h) {
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
        ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.3;
        const len = 40 + Math.random() * 60;
        const angle = Math.PI * 0.35;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        grad.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawWaterfallPreview(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#001a33');
    bg.addColorStop(1, '#002040');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(w * 0.35 - 15, 0, 15, h * 0.6);
    ctx.fillRect(w * 0.65, 0, 15, h * 0.6);

    ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const x = w * 0.4 + Math.random() * w * 0.2;
        const y = Math.random() * h * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 15 + Math.random() * 15);
        ctx.stroke();
    }

    const poolY = h * 0.75;
    ctx.fillStyle = 'rgba(0, 50, 100, 0.5)';
    ctx.fillRect(0, poolY, w, h - poolY);
}

function drawNeonPreview(ctx, w, h) {
    const colors = ['#ff00ff', '#00ffff', '#ff0080', '#0080ff', '#8000ff'];
    for (let i = 0; i < 8; i++) {
        const y = (i / 8) * h;
        const color = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 3) {
            const yOff = Math.sin(x * 0.01 + i) * 10;
            ctx.lineTo(x, y + yOff);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function drawGeometricPreview(ctx, w, h) {
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 15 + Math.random() * 30;
        const hue = Math.random() * 360;
        ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.lineWidth = 2;

        if (i % 3 === 0) {
            ctx.beginPath();
            for (let j = 0; j < 3; j++) {
                const angle = (j / 3) * Math.PI * 2 - Math.PI / 2;
                const px = x + Math.cos(angle) * size;
                const py = y + Math.sin(angle) * size;
                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (i % 3 === 1) {
            ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawPendulumPreview(ctx, w, h) {
    const pivotX = w / 2;
    const pivotY = h * 0.2;
    const length = Math.min(w, h) * 0.35;
    const angle = Math.PI / 4;
    const bobX = pivotX + Math.sin(angle) * length;
    const bobY = pivotY + Math.cos(angle) * length;

    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = 'rgba(200, 170, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 170, 80, 0.8)';
    ctx.fill();

    const glow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 12);
    glow.addColorStop(0, 'rgba(255, 220, 100, 0.6)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bobX, bobY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#c8aa50';
    ctx.fill();
}

function drawRetroPreview(ctx, w, h) {
    const chars = '01アイウエオ';
    ctx.font = '8px monospace';
    for (let x = 0; x < w; x += 8) {
        for (let y = 0; y < h; y += 12) {
            if (Math.random() > 0.7) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillStyle = `rgba(0, 255, 0, ${0.2 + Math.random() * 0.5})`;
                ctx.fillText(char, x, y);
            }
        }
    }
}

function drawCrystalPreview(ctx, w, h) {
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 15 + Math.random() * 25;
        const hue = 200 + Math.random() * 60;
        const facets = 5 + Math.floor(Math.random() * 3);

        ctx.beginPath();
        for (let j = 0; j < facets; j++) {
            const angle = (j / facets) * Math.PI * 2;
            const r = size * (0.8 + Math.sin(angle * 2) * 0.2);
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${hue}, 60%, 70%, 0.4)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, `hsla(${hue}, 60%, 80%, 0.15)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

function drawThunderPreview(ctx, w, h) {
    ctx.fillStyle = '#001020';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 1, y + 10 + Math.random() * 15);
        ctx.stroke();
    }

    let x = w * 0.3 + Math.random() * w * 0.4;
    let y = 0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    while (y < h * 0.6) {
        x += (Math.random() - 0.5) * 30;
        y += 8 + Math.random() * 15;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawSakuraPreview(ctx, w, h) {
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 3 + Math.random() * 5;
        const rotation = Math.random() * Math.PI * 2;
        const hue = 330 + Math.random() * 30;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size * 0.5, -size * 0.3, size, -size * 0.1, size, 0);
        ctx.bezierCurveTo(size, size * 0.1, size * 0.5, size * 0.3, 0, 0);
        ctx.fillStyle = `hsla(${hue}, 70%, 75%, 0.6)`;
        ctx.fill();
        ctx.restore();
    }
}

function drawDvdPreview(ctx, w, h) {
    const lw = w * 0.36;
    const lh = lw * 0.56;
    const x = (Math.sin(w * 12.9898 + h * 78.233) * 0.5 + 0.5) * (w - lw);
    const y = (Math.sin(h * 37.719 + w * 11.135) * 0.5 + 0.5) * (h - lh);
    const hue = (w * 13 + h * 7) % 360;

    ctx.fillStyle = `hsl(${hue}, 75%, 52%)`;
    ctx.fillRect(x, y, lw, lh);
    ctx.fillStyle = '#fff';
    ctx.font = `italic bold ${lh * 0.45}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', x + lw / 2, y + lh / 2);
}

function animateDvd(ctx, w, h, t) {
    const lw = w * 0.36;
    const lh = lw * 0.56;
    const rangeX = Math.max(1, w - lw);
    const rangeY = Math.max(1, h - lh);
    let px = (t * 3) % (rangeX * 2);
    if (px > rangeX) px = rangeX * 2 - px;
    let py = (t * 2) % (rangeY * 2);
    if (py > rangeY) py = rangeY * 2 - py;

    const hue = (t * 4) % 360;

    ctx.fillStyle = `hsl(${hue}, 75%, 52%)`;
    ctx.fillRect(px, py, lw, lh);

    ctx.fillStyle = '#fff';
    ctx.font = `italic bold ${lh * 0.45}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', px + lw / 2, py + lh / 2);
}

function hashRand(n) {
    return (Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;
}

function drawPipesPath(ctx, w, h, seed, hueBase) {
    const cell = w / 8;
    let x = cell + Math.floor(hashRand(seed) * 7) * cell;
    let y = cell + Math.floor(hashRand(seed + 1) * 4) * cell;
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    let dir = Math.floor(hashRand(seed + 2) * 4);

    ctx.lineWidth = Math.max(6, cell * 0.28);
    ctx.lineCap = 'butt';

    for (let seg = 0; seg < 9; seg++) {
        const hue = (hueBase + seg * 25) % 360;
        ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;

        const len = cell * (1 + Math.floor(hashRand(seed + seg * 3) * 2));
        const nx = x + dirs[dir][0] * len;
        const ny = y + dirs[dir][1] * len;

        if (nx < 0 || nx > w || ny < 0 || ny > h) {
            dir = (dir + 1) % 4;
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        ctx.fillStyle = `hsl(${hue}, 70%, 32%)`;
        ctx.beginPath();
        ctx.arc(nx, ny, ctx.lineWidth / 2 + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue}, 70%, 65%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.lineWidth = Math.max(6, cell * 0.28);

        x = nx;
        y = ny;
        dir = hashRand(seed + seg * 7) > 0.55 ? (dir + 1) % 4 : dir;
    }
}

function drawPipesPreview(ctx, w, h) {
    drawPipesPath(ctx, w, h, w * 0.13 + h * 0.07, (w * 3) % 360);
    drawPipesPath(ctx, w, h, w * 0.29 + h * 0.11, (w * 3 + 140) % 360);
}

function animatePipes(ctx, w, h, t) {
    const phase = Math.floor(t / 90);
    drawPipesPath(ctx, w, h, phase * 17.31 + 5, (phase * 63) % 360);
    drawPipesPath(ctx, w, h, phase * 41.77 + 91, (phase * 63 + 150) % 360);
}

function drawMystifyPolyline(ctx, w, h, t, hue) {
    const pts = [];
    for (let k = 0; k < 4; k++) {
        pts.push({
            x: (Math.sin(t * 0.031 + k * 2.4 + hue) * 0.5 + 0.5) * w,
            y: (Math.cos(t * 0.024 + k * 1.7 + hue * 0.1) * 0.5 + 0.5) * h
        });
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let k = 1; k < 4; k++) {
        ctx.lineTo(pts[k].x, pts[k].y);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.9)`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
}

function drawMystifyPreview(ctx, w, h) {
    for (let i = 7; i >= 0; i--) {
        const fade = 1 - i / 8;
        ctx.globalAlpha = fade;
        drawMystifyPolyline(ctx, w, h, w * 3 - i * 6, (h * 2) % 360);
        drawMystifyPolyline(ctx, w, h, w * 3 - i * 6 + 40, (h * 2 + 130) % 360);
        ctx.globalAlpha = 1;
    }
}

function animateMystify(ctx, w, h, t) {
    for (let i = 7; i >= 0; i--) {
        ctx.globalAlpha = 1 - i / 9;
        drawMystifyPolyline(ctx, w, h, t - i * 6, t * 0.4 % 360);
        drawMystifyPolyline(ctx, w, h, t - i * 6 + 55, (t * 0.4 + 140) % 360);
        ctx.globalAlpha = 1;
    }
}

function drawBoidTriangle(ctx, x, y, angle, size, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.65, size * 0.5);
    ctx.lineTo(-size * 0.38, 0);
    ctx.lineTo(-size * 0.65, -size * 0.5);
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue}, 85%, 62%)`;
    ctx.fill();
    ctx.restore();
}

function drawBoidsPreview(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 26; i++) {
        const a = (w + h) * 0.01 + i * 0.42;
        const r = (0.18 + 0.13 * Math.sin(i * 1.7)) * Math.min(w, h);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.2 + i) * r * 0.7;
        drawBoidTriangle(ctx, x, y, a + Math.PI / 2, 8, 190 + i * 4);
    }
}

function animateBoids(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 30; i++) {
        const a = t * 0.02 + i * 0.38;
        const r = (0.16 + 0.14 * Math.sin(t * 0.008 + i * 1.3)) * Math.min(w, h);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.15 + i * 0.5) * r * 0.72;
        const heading = a + Math.PI / 2 + Math.sin(t * 0.05 + i) * 0.2;
        drawBoidTriangle(ctx, x, y, heading, 9, 190 + ((i * 9) % 110));
    }
}

function drawLifeGrid(ctx, w, h, gen) {
    const cell = 10;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const seed = x * 91.7 + y * 137.3;
            const stable = hashRand(seed) < 0.12;
            const alive = stable || hashRand(seed * 1.7 + gen * 13.9) < 0.14;
            if (alive) {
                const fresh = !stable && hashRand(seed + gen) > 0.8;
                ctx.fillStyle = fresh ? 'rgb(190,255,170)' : `hsl(${150 + (x + y) % 40}, 70%, ${45 + (x % 3) * 6}%)`;
                ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
            }
        }
    }
}

function drawLifePreview(ctx, w, h) {
    drawLifeGrid(ctx, w, h, Math.floor(w * 2.7));
}

function animateLife(ctx, w, h, t) {
    drawLifeGrid(ctx, w, h, Math.floor(t / 5));
}

const SAND_COLORS = ['#e8cf96', '#cfae74', '#b08c55'];

function drawSandPiles(ctx, w, h, t) {
    const cell = 4;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);

    for (let x = 0; x < cols; x++) {
        const hill =
            Math.max(0, Math.sin(x * 0.05 + w * 0.01) * 22 - 4) +
            Math.max(0, Math.sin(x * 0.013 + h * 0.03) * 30);
        const top = h - 12 - hill;
        for (let y = Math.floor(top / cell); y < rows; y++) {
            const shade = (x + y + ((t / 40) | 0)) % 3;
            ctx.fillStyle = SAND_COLORS[shade];
            ctx.fillRect(x * cell, y * cell, cell, cell);
        }
    }

    const ex = (Math.sin(t * 0.008) * 0.5 + 0.5) * w;
    const egx = Math.floor(ex / cell);
    const fallH = Math.floor(t % 26);
    ctx.fillStyle = SAND_COLORS[0];
    for (let k = 0; k < 5; k++) {
        const gy = fallH + k * 9;
        if (gy < h - 20) {
            ctx.fillRect((egx + (k % 2)) * cell, gy * cell, cell, cell);
        }
    }
}

function drawSandPreview(ctx, w, h) {
    drawSandPiles(ctx, w, h, w * 1.7);
}

function animateSand(ctx, w, h, t) {
    drawSandPiles(ctx, w, h, t);
}

function drawFlowfieldStreams(ctx, w, h, t) {
    const steps = 7;
    ctx.lineWidth = 1.3;

    for (let i = 0; i < 70; i++) {
        let x = hashRand(i * 3.1 + w * 0.01) * w;
        let y = hashRand(i * 7.7 + h * 0.02) * h;

        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < steps; s++) {
            const a =
                Math.sin(x * 0.01 + t * 0.001) * 2 +
                Math.cos(y * 0.011 - t * 0.0008) * 2;
            x += Math.cos(a) * 6;
            y += Math.sin(a) * 6;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${(i * 5 + t * 0.05) % 360}, 85%, 62%, 0.65)`;
        ctx.stroke();
    }
}

function drawFlowfieldPreview(ctx, w, h) {
    drawFlowfieldStreams(ctx, w, h, (w + h) * 20);
}

function animateFlowfield(ctx, w, h, t) {
    drawFlowfieldStreams(ctx, w, h, t * 8);
}

const DONUT_CHARS = '.,-~:;=!*#@';

function drawDonutPreview(ctx, w, h, t) {
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 46;

    for (let k = 0; k < 260; k++) {
        const ang = k * 0.28 + t * 0.03;
        const band = (Math.sin(k * 0.13 + t * 0.05) + 1) / 2;
        const r = (14 + band * 22) * scale;
        const x = cx + Math.cos(ang) * r * 1.35;
        const y = cy + Math.sin(ang) * r * 0.75;

        if (Math.abs(x - cx) > w / 2 - 8 || Math.abs(y - cy) > h / 2 - 8) continue;

        const ci = Math.floor(band * (DONUT_CHARS.length - 1));
        ctx.fillStyle = `rgba(${60 + ci * 15}, ${200}, ${110}, ${0.3 + band * 0.7})`;
        ctx.fillText(DONUT_CHARS[ci], x, y);
    }
}

function animateDonut(ctx, w, h, t) {
    drawDonutPreview(ctx, w, h, t);
}

function treeBranch(ctx, x, y, angle, len, width, depth, wind) {
    if (depth === 0 || len < 2) return;

    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;

    ctx.strokeStyle = `hsl(${24 + (8 - depth) * 14}, 45%, ${20 + (8 - depth) * 6}%)`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    if (depth <= 1) {
        ctx.fillStyle = ((nx * 7 + ny * 13) | 0) % 2 ? 'hsla(340, 75%, 68%, 0.9)' : 'hsla(110, 70%, 60%, 0.9)';
        ctx.beginPath();
        ctx.arc(nx, ny, 1.8 + Math.abs(wind), 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    const spread = 0.44;
    treeBranch(ctx, nx, ny, angle - spread + wind * 0.05, len * 0.72, width * 0.7, depth - 1, wind);
    treeBranch(ctx, nx, ny, angle + spread + wind * 0.05, len * 0.72, width * 0.7, depth - 1, wind);
}

function drawFractalTreePreview(ctx, w, h) {
    const t = (w * 3 + h) * 0.01;
    const wind = Math.sin(t) * 0.5 + Math.sin(t * 2.7) * 0.25;

    treeBranch(
        ctx,
        w / 2,
        h - 6,
        -Math.PI / 2 + wind * 0.04,
        Math.min(h, w) * 0.19,
        5,
        7,
        wind
    );
}

function animateFractalTree(ctx, w, h, t) {
    const wind = Math.sin(t * 0.008) * 0.6 + Math.sin(t * 0.0021) * 0.35;

    treeBranch(
        ctx,
        w / 2,
        h - 4,
        -Math.PI / 2 + wind * 0.05,
        Math.min(h, w) * 0.2,
        6,
        8,
        wind
    );
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

function animateStarfield(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 80; i++) {
        const seed = i * 137.508;
        const angle = seed % (Math.PI * 2);
        const dist = ((seed + t * 0.8) % Math.max(w, h));
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = Math.max(0.3, 2 - dist / Math.max(w, h) * 2);
        const alpha = Math.max(0, 1 - dist / Math.max(w, h));
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }
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

function animateForest(ctx, w, h, t) {
    const groundY = h * 0.85;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, groundY, w, h - groundY);

    for (let i = 0; i < 15; i++) {
        const x = (i / 15) * w + Math.sin(t * 0.01 + i) * 5;
        const th = 50 + (i % 3) * 40;
        const tw = 18 + (i % 2) * 10;
        ctx.fillStyle = `rgb(${10 + i * 2}, ${35 + i * 3}, ${15 + i})`;
        ctx.beginPath();
        ctx.moveTo(x, groundY - th);
        ctx.lineTo(x - tw / 2, groundY);
        ctx.lineTo(x + tw / 2, groundY);
        ctx.closePath();
        ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
        const fogY = groundY - 50 + i * 25;
        const gradient = ctx.createLinearGradient(0, fogY, 0, fogY + 60);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(80, 120, 80, ${0.05 - i * 0.01})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(Math.sin(t * 0.008 + i) * 40 - 30, fogY, w + 60, 60);
    }

    for (let i = 0; i < 20; i++) {
        const seed = i * 73.7;
        const baseX = (seed * 13.37) % w;
        const baseY = groundY - 20 - (seed * 7.13) % 120;
        const x = baseX + Math.sin(t * 0.015 + seed) * 8;
        const y = baseY + Math.cos(t * 0.012 + seed * 0.7) * 5;
        const alpha = (Math.sin(t * 0.05 + seed) + 1) / 2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, `rgba(255, 255, 100, ${alpha * 0.5})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }
}

function animateMeteor(ctx, w, h, t) {
    for (let i = 0; i < 60; i++) {
        const x = (i * 17.3) % w;
        const y = (i * 23.7) % h;
        const alpha = 0.2 + Math.sin(t * 0.03 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
        const seed = i * 47.3;
        const sx = (seed * 7.13 + t * 0.5) % (w + 100) - 50;
        const sy = -10 + (t * 0.3 + seed) % (h * 0.4);
        const len = 30 + (i % 3) * 20;
        const angle = Math.PI * 0.35;
        const ex = sx + Math.cos(angle) * len;
        const ey = sy + Math.sin(angle) * len;

        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, `rgba(255, 200, 100, ${0.8 - i * 0.1})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
        glow.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
    }
}

function animateWaterfall(ctx, w, h, t) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#001a33');
    bg.addColorStop(1, '#002040');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(w * 0.35 - 15, 0, 15, h * 0.6);
    ctx.fillRect(w * 0.65, 0, 15, h * 0.6);

    for (let i = 0; i < 20; i++) {
        const x = w * 0.4 + Math.sin(t * 0.02 + i * 0.3) * w * 0.08;
        const y = ((t * 3 + i * 15) % (h * 0.65));
        const len = 10 + (i % 4) * 5;
        const grad = ctx.createLinearGradient(x, y, x, y + len);
        grad.addColorStop(0, 'rgba(100, 180, 255, 0.1)');
        grad.addColorStop(0.5, 'rgba(150, 200, 255, 0.5)');
        grad.addColorStop(1, 'rgba(200, 230, 255, 0.2)');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    const poolY = h * 0.75;
    ctx.fillStyle = 'rgba(0, 50, 100, 0.4)';
    ctx.fillRect(0, poolY, w, h - poolY);

    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, poolY + 5 + i * 8);
        for (let x = 0; x <= w; x += 5) {
            const y = poolY + 5 + i * 8 + Math.sin(x * 0.02 + t * 0.03 + i) * 3;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(100, 180, 255, ${0.15 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function animateNeon(ctx, w, h, t) {
    const neonColors = [
        [255, 0, 255],
        [0, 255, 255],
        [255, 0, 128],
        [0, 128, 255],
        [128, 0, 255]
    ];

    for (let i = 0; i < 10; i++) {
        const y = (i / 10) * h;
        const color = neonColors[i % neonColors.length];
        const alpha = 0.3 + Math.sin(t * 0.02 + i * 0.8) * 0.25;

        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.5})`;

        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 3) {
            const yOff = Math.sin(x * 0.01 + t * 0.02 + i * 0.5) * 12;
            ctx.lineTo(x, y + yOff);
        }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 40;
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.2})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}

function animateGeometric(ctx, w, h, t) {
    const shapes = [];
    for (let i = 0; i < 12; i++) {
        shapes.push({
            x: (i * 73.7 + Math.sin(t * 0.01 + i) * 30) % w,
            y: (i * 47.3 + Math.cos(t * 0.008 + i * 0.7) * 30) % h,
            size: 15 + (i % 4) * 10,
            rotation: t * 0.02 + i * 0.5,
            hue: (i * 30 + t) % 360,
            type: i % 3
        });
    }

    shapes.forEach(shape => {
        ctx.strokeStyle = `hsl(${shape.hue}, 70%, 60%)`;
        ctx.lineWidth = 2;

        if (shape.type === 0) {
            ctx.beginPath();
            for (let j = 0; j < 3; j++) {
                const angle = (j / 3) * Math.PI * 2 + shape.rotation;
                const px = shape.x + Math.cos(angle) * shape.size;
                const py = shape.y + Math.sin(angle) * shape.size;
                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (shape.type === 1) {
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.rotate(shape.rotation);
            ctx.beginPath();
            ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function animatePendulum(ctx, w, h, t) {
    const pivotX = w / 2;
    const pivotY = h * 0.2;
    const length = Math.min(w, h) * 0.35;
    const angle = Math.PI / 4 * Math.sin(t * 0.03);
    const bobX = pivotX + Math.sin(angle) * length;
    const bobY = pivotY + Math.cos(angle) * length;

    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = 'rgba(200, 170, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 170, 80, 0.8)';
    ctx.fill();

    const glow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 15);
    glow.addColorStop(0, 'rgba(255, 220, 100, 0.6)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#c8aa50';
    ctx.fill();
}

function animateRetro(ctx, w, h, t) {
    const pixelSize = 8;
    const chars = '01アイウエオカキクケコ';
    ctx.font = `${pixelSize}px monospace`;

    for (let x = 0; x < w; x += pixelSize) {
        for (let i = 0; i < 3; i++) {
            const y = ((t * 2 + x * 0.3 + i * 50) % (h + 20)) - 10;
            const char = chars[Math.floor((x + t) % chars.length)];
            const brightness = Math.random();
            if (brightness > 0.7) {
                ctx.fillStyle = '#0f0';
            } else if (brightness > 0.4) {
                ctx.fillStyle = '#0a0';
            } else {
                ctx.fillStyle = '#050';
            }
            ctx.fillText(char, x, y);
        }
    }
}

function animateCrystal(ctx, w, h, t) {
    const crystals = [];
    for (let i = 0; i < 6; i++) {
        crystals.push({
            x: (i * 83.7 + Math.sin(t * 0.008 + i) * 20) % w,
            y: (i * 57.3 + Math.cos(t * 0.006 + i * 0.7) * 20) % h,
            size: 15 + (i % 3) * 12,
            rotation: t * 0.01 + i * 0.8,
            hue: 200 + (i * 15) % 60,
            facets: 5 + (i % 3),
            shimmer: (Math.sin(t * 0.03 + i * 1.5) + 1) / 2
        });
    }

    crystals.forEach(crystal => {
        ctx.save();
        ctx.translate(crystal.x, crystal.y);
        ctx.rotate(crystal.rotation);

        ctx.beginPath();
        for (let j = 0; j < crystal.facets; j++) {
            const angle = (j / crystal.facets) * Math.PI * 2;
            const r = crystal.size * (0.8 + Math.sin(angle * 2) * 0.2);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.strokeStyle = `hsla(${crystal.hue}, 60%, 70%, ${0.3 + crystal.shimmer * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, crystal.size);
        grad.addColorStop(0, `hsla(${crystal.hue}, 60%, 80%, ${0.1 + crystal.shimmer * 0.1})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();

        for (let k = 0; k < 2; k++) {
            const sparkAngle = crystal.shimmer * Math.PI * 2 + k * 2;
            const sparkX = crystal.x + Math.cos(sparkAngle) * crystal.size * 0.5;
            const sparkY = crystal.y + Math.sin(sparkAngle) * crystal.size * 0.5;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${crystal.hue + 30}, 80%, 90%, ${crystal.shimmer * 0.4})`;
            ctx.fill();
        }
    });
}

function animateThunder(ctx, w, h, t) {
    ctx.fillStyle = 'rgba(0, 5, 20, 0.3)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 80; i++) {
        const x = (i * 11.3) % w;
        const y = (i * 7.7 + t * 4) % h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 1, y + 8 + (i % 3) * 4);
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    if (t % 90 < 3) {
        for (let b = 0; b < 2; b++) {
            let x = w * 0.2 + Math.random() * w * 0.6;
            let y = 0;
            ctx.beginPath();
            ctx.moveTo(x, y);
            while (y < h * 0.6) {
                x += (Math.random() - 0.5) * 30;
                y += 8 + Math.random() * 15;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(100, 150, 255, 0.08)';
        ctx.fillRect(0, 0, w, h);
    }
}

function animateSakura(ctx, w, h, t) {
    const petals = [];
    for (let i = 0; i < 25; i++) {
        const seed = i * 67.3;
        petals.push({
            x: (seed * 3.7 + t * 0.5 + Math.sin(t * 0.02 + seed) * 30) % (w + 20) - 10,
            y: (seed * 2.3 + t * 0.8) % (h + 20) - 10,
            size: 3 + (i % 3) * 2,
            rotation: t * 0.02 + seed,
            hue: 330 + (i * 3) % 30,
            wobble: Math.sin(t * 0.02 + seed) * 15
        });
    }

    petals.forEach(petal => {
        ctx.save();
        ctx.translate(petal.x + petal.wobble, petal.y);
        ctx.rotate(petal.rotation);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(petal.size * 0.5, -petal.size * 0.3, petal.size, -petal.size * 0.1, petal.size, 0);
        ctx.bezierCurveTo(petal.size, petal.size * 0.1, petal.size * 0.5, petal.size * 0.3, 0, 0);
        ctx.fillStyle = `hsla(${petal.hue}, 70%, 75%, 0.6)`;
        ctx.fill();

        ctx.restore();
    });
}
