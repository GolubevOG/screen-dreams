const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.z = 500;

const starsGeometry = new THREE.BufferGeometry();
const starCount = 3000;
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4000;

    const brightness = 0.5 + Math.random() * 0.5;
    colors[i * 3] = brightness;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = brightness + Math.random() * 0.2;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const starsMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    camera.position.z -= 2;

    const positions = stars.geometry.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        if (positions[i * 3 + 2] > camera.position.z) {
            positions[i * 3 + 2] -= 4000;
        }
    }
    stars.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
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
