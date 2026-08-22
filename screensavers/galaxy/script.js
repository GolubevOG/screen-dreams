const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

camera.position.z = 300;

const galaxyGroup = new THREE.Group();
scene.add(galaxyGroup);

const arms = 4;
const starsPerArm = 1000;
const totalStars = arms * starsPerArm;
const galaxyRadius = 200;

const positions = new Float32Array(totalStars * 3);
const colors = new Float32Array(totalStars * 3);
const color = new THREE.Color();

let idx = 0;
for (let arm = 0; arm < arms; arm++) {
    const armAngle = (arm / arms) * Math.PI * 2;

    for (let i = 0; i < starsPerArm; i++) {
        const distance = Math.random() * galaxyRadius;
        const angle = armAngle + (distance / galaxyRadius) * Math.PI * 2;
        const spread = (Math.random() - 0.5) * 30 * (distance / galaxyRadius);

        positions[idx * 3] = Math.cos(angle) * distance;
        positions[idx * 3 + 1] = spread;
        positions[idx * 3 + 2] = Math.sin(angle) * distance;

        const distanceFromCenter = distance / galaxyRadius;
        if (distanceFromCenter < 0.3) {
            color.setHSL(0.1, 0.8, 0.6 + Math.random() * 0.2);
        } else if (distanceFromCenter < 0.6) {
            color.setHSL(0.6, 0.7, 0.5 + Math.random() * 0.3);
        } else {
            color.setHSL(0.7, 0.6, 0.4 + Math.random() * 0.4);
        }

        const brightness = 0.6 + Math.random() * 0.4;
        colors[idx * 3] = color.r * brightness;
        colors[idx * 3 + 1] = color.g * brightness;
        colors[idx * 3 + 2] = color.b * brightness;

        idx++;
    }
}

const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const starsMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
});

galaxyGroup.add(new THREE.Points(starsGeometry, starsMaterial));

const coreGeometry = new THREE.SphereGeometry(15, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffcc,
    transparent: true,
    opacity: 0.3
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
galaxyGroup.add(core);

const coreGlow = new THREE.PointLight(0xffffcc, 1, 200);
galaxyGroup.add(coreGlow);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

function animate() {
    requestAnimationFrame(animate);

    galaxyGroup.rotation.y += 0.001;
    galaxyGroup.rotation.x += 0.0005;

    camera.position.x += (mouseX * 50 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 50 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

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
