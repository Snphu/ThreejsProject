

// ======================== Thiết lập Three.js ========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6EA6DA);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.zoomSpeed = 0.5;
const fontLoader = new THREE.FontLoader(); // Khởi tạo fontLoader

// ======================== Biến sóng âm ========================
let amplitude = 9.3;
let frequency = 0.43;
let wavelength = 11.63;
let showWaveDiagram = false;
let isAnimating = false;
let waveActive = false;
let waveRadius = 0;
let textMeshX, textMeshY;

// ======================== Tạo loa ========================
const speakerGroup = new THREE.Group();
createSpeaker();
speakerGroup.rotation.z = Math.PI / 2;
speakerGroup.position.x = -5;
speakerGroup.scale.set(1.5, 1.5, 1.5);
scene.add(speakerGroup);

// ======================== Tạo sóng âm (particles) ========================
const particles = [];
const particleCount = 100;
const particleSpacing = 0.5;
const rows = 10;
const rowSpacing = 1;
createParticles();

// ======================== Tạo sóng hình sin ========================
const sinWaveGeometry = new THREE.BufferGeometry();
const sinWaveMaterial = new THREE.LineBasicMaterial({ color: 0xFF6347 });
const sinWaveVertices = [];
const sinWaveLength = 50;
const sinWaveSegments = 100;
const wavePositionOffset = 20;
for (let i = 0; i <= sinWaveSegments; i++) {
    sinWaveVertices.push(i * sinWaveLength / sinWaveSegments, wavePositionOffset, 0);
}
sinWaveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sinWaveVertices, 3));
const sinWaveLine = new THREE.Line(sinWaveGeometry, sinWaveMaterial);
scene.add(sinWaveLine);
sinWaveLine.visible = false;

// ======================== Tạo trục U-Y ========================
const axisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

// Trục X (U)
const axisGeometryX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(sinWaveLength, 0, 0),
]);
const axisX = new THREE.Line(axisGeometryX, axisMaterial);
axisX.position.set(0, 20, 0);
scene.add(axisX);

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometryX = new THREE.TextGeometry('Y', { font: font, size: 1, height: 0.1 });
    const textMaterialX = new THREE.MeshBasicMaterial({ color: 0x000000 });
    textMeshX = new THREE.Mesh(textGeometryX, textMaterialX);
    textMeshX.position.set(sinWaveLength + 2, 20, 0);
    scene.add(textMeshX);
});

const axisGeometryY = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 20 - amplitude, 0),
    new THREE.Vector3(0, 20 + amplitude, 0),
]);
const axisY = new THREE.Line(axisGeometryY, axisMaterial);
scene.add(axisY);

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometryY = new THREE.TextGeometry('U', { font: font, size: 1, height: 0.1 });
    const textMaterialY = new THREE.MeshBasicMaterial({ color: 0x000000 });
    textMeshY = new THREE.Mesh(textGeometryY, textMaterialY);
    textMeshY.position.set(1, 20 + amplitude + 1, 0);
    scene.add(textMeshY);
});

const amplitudeLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 20 + amplitude, 0),
    new THREE.Vector3(sinWaveLength, 20 + amplitude, 0),
]);
const amplitudeLineMaterial = new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 1, gapSize: 0.5 });
const amplitudeLine = new THREE.Line(amplitudeLineGeometry, amplitudeLineMaterial);
amplitudeLine.computeLineDistances();
scene.add(amplitudeLine);

const amplitudeLineNegativeGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 20 - amplitude, 0),
    new THREE.Vector3(sinWaveLength, 20 - amplitude, 0),
]);
const amplitudeLineNegative = new THREE.Line(amplitudeLineNegativeGeometry, amplitudeLineMaterial);
amplitudeLineNegative.computeLineDistances();
scene.add(amplitudeLineNegative);

function createSpeaker() {
    const outerMeshGeometry = new THREE.CylinderGeometry(3.5, 3.5, 0.5, 32);
    const outerMeshMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const outerMesh = new THREE.Mesh(outerMeshGeometry, outerMeshMaterial);
    speakerGroup.add(outerMesh);

    const rimGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100);
    const rimMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    speakerGroup.add(rim);

    const membraneGeometry = new THREE.ConeGeometry(2.5, 1.5, 32);
    const membraneMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
    membrane.position.z = -0.75;
    speakerGroup.add(membrane);

    const surroundGeometry = new THREE.TorusGeometry(2.6, 0.15, 16, 100);
    const surroundMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const surround = new THREE.Mesh(surroundGeometry, surroundMaterial);
    surround.rotation.x = Math.PI / 2;
    surround.position.z = -0.5;
    speakerGroup.add(surround);

    const coilGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const coilMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
    const coil = new THREE.Mesh(coilGeometry, coilMaterial);
    coil.position.z = -1.25;
    speakerGroup.add(coil);
}

function createParticles() {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.x = i * particleSpacing;
            particle.position.y = j * rowSpacing - (rows * rowSpacing) / 2;
            particles.push(particle);
            scene.add(particle);
        }
    }
}

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (isAnimating && waveActive) {
        waveRadius += 0.1;
        particles.forEach((particle, index) => {
            const distance = Math.sqrt(Math.pow(particle.position.x, 2) + Math.pow(particle.position.y, 2));
            const opacity = Math.max(0, Math.min(1, 1 - distance / waveRadius));
            particle.material.opacity = opacity;
        });
    }

    if (showWaveDiagram && isAnimating) {
        time += 0.1;
        for (let i = 0; i <= sinWaveSegments; i++) {
            const x = (i * sinWaveLength / sinWaveSegments) - (time * frequency * 10);
            const y = wavePositionOffset + amplitude * Math.sin(x / wavelength * 2 * Math.PI);
            sinWaveLine.geometry.attributes.position.setY(i, y);
        }
        sinWaveLine.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}
animate();

document.getElementById("amplitudeSlider").oninput = function () {
    amplitude = parseFloat(this.value);
    document.getElementById("amplitudeDisplay").innerText = amplitude.toFixed(1);
    amplitudeLine.geometry.attributes.position.setY(0, 20 + amplitude);
    amplitudeLine.geometry.attributes.position.setY(1, 20 + amplitude);
    amplitudeLine.geometry.attributes.position.needsUpdate = true;

    amplitudeLineNegative.geometry.attributes.position.setY(0, 20 - amplitude);
    amplitudeLineNegative.geometry.attributes.position.setY(1, 20 - amplitude);
    amplitudeLineNegative.geometry.attributes.position.needsUpdate = true;
};

document.getElementById("frequencySlider").oninput = function () {
    frequency = parseFloat(this.value);
    document.getElementById("frequencyDisplay").innerText = frequency.toFixed(2);
};

document.getElementById("wavelengthSlider").oninput = function () {
    wavelength = parseFloat(this.value);
    document.getElementById("wavelengthDisplay").innerText = wavelength.toFixed(2);
};

document.getElementById("mediumSelect").onchange = function () {
    const medium = this.value;
    if (medium === "liquid") {
        amplitude = 9.3;
        frequency = 0.43;
        wavelength = 11.63;
    } else if (medium === "air") {
        amplitude = 5;
        frequency = 0.6;
        wavelength = 15;
    } else if (medium === "solid") {
        amplitude = 2;
        frequency = 0.8;
        wavelength = 5;
    }
    document.getElementById("amplitudeSlider").value = amplitude;
    document.getElementById("frequencySlider").value = frequency;
    document.getElementById("wavelengthSlider").value = wavelength;
    document.getElementById("amplitudeDisplay").innerText = amplitude.toFixed(1);
    document.getElementById("frequencyDisplay").innerText = frequency.toFixed(2);
    document.getElementById("wavelengthDisplay").innerText = wavelength.toFixed(2);
};

document.getElementById("waveDiagram").onchange = function () {
    showWaveDiagram = this.checked;
    sinWaveLine.visible = showWaveDiagram;
    axisX.visible = showWaveDiagram;
    axisY.visible = showWaveDiagram;
    amplitudeLine.visible = showWaveDiagram;
    amplitudeLineNegative.visible = showWaveDiagram;
    if (textMeshX) textMeshX.visible = showWaveDiagram;
    if (textMeshY) textMeshY.visible = showWaveDiagram;
};

document.getElementById("toggleButton").onclick = function () {
    waveActive = !waveActive;
    isAnimating = waveActive;
    this.textContent = waveActive ? "Tắt" : "Bật";
    waveRadius = 0;
};

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});




document.addEventListener("DOMContentLoaded", () => {
    const buttons = [
        { button: document.getElementById("button1"), div: document.getElementById("infoBox") },
        { button: document.getElementById("button2"), div: document.getElementById("infoBox2") },
      ];
  
      buttons.forEach(({ button, div }) => {
        button.addEventListener("click", () => {
          const isActive = button.classList.contains("active");
    
          // Tắt tất cả các nút và div khác
          buttons.forEach(({ button: otherButton, div: otherDiv }) => {
            otherButton.classList.remove("active");
            otherDiv.classList.add("hidden");
          });
    
          // Nếu nút hiện tại đã kích hoạt, tắt nó
          if (isActive) {
            button.classList.remove("active");
            div.classList.add("hidden");
          } else {
            // Nếu nút hiện tại chưa kích hoạt, bật nó
            button.classList.add("active");
            div.classList.remove("hidden");
          }
        });
      });
});