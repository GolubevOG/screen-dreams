const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const raindrops = [];
for (let i = 0; i < 200; i++) {
    raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 5 + Math.random() * 10,
        length: 10 + Math.random() * 20
    });
}

let lightningTimer = 0;
let lightningAlpha = 0;
let lightningBolts = [];

function createLightning() {
    lightningBolts = [];
    for (let b = 0; b < 2 + Math.floor(Math.random() * 2); b++) {
        const bolt = [];
        let x = Math.random() * canvas.width;
        let y = 0;
        bolt.push({ x, y });
        while (y < canvas.height * 0.7) {
            x += (Math.random() - 0.5) * 40;
            y += 10 + Math.random() * 20;
            bolt.push({ x, y });
        }
        lightningBolts.push(bolt);
    }
    lightningAlpha = 1;
}

function animate() {
    ctx.fillStyle = 'rgba(0, 5, 20, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lightningTimer++;
    if (lightningTimer > 120 + Math.random() * 180) {
        createLightning();
        lightningTimer = 0;
    }

    if (lightningAlpha > 0) {
        ctx.fillStyle = `rgba(100, 150, 255, ${lightningAlpha * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lightningBolts.forEach(bolt => {
            ctx.beginPath();
            ctx.moveTo(bolt[0].x, bolt[0].y);
            for (let i = 1; i < bolt.length; i++) {
                ctx.lineTo(bolt[i].x, bolt[i].y);
            }
            ctx.strokeStyle = `rgba(200, 200, 255, ${lightningAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.strokeStyle = `rgba(100, 150, 255, ${lightningAlpha * 0.3})`;
            ctx.lineWidth = 6;
            ctx.stroke();
        });

        lightningAlpha -= 0.05;
    }

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 1;
    raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animate);
}

animate();

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
