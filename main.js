// khởi tạo 3 js 
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'; // Import FontLoader


// Tạo scene, camera và renderer
const scene = new THREE.Scene(); // tất cả đối tượng 3D sẽ được thêm vào scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // 75 độ, tương ứng với tỷ lệ khung hình từ 0.1 đến 1000 đơn vị
camera.position.set(60, 5, 5); // vị trí ban đầu của cam trong kgian 3D

const renderer = new THREE.WebGLRenderer({ antialias: true }); //antialias để làm mịn các đường viền, cải thiện h/a
renderer.setSize(window.innerWidth, window.innerHeight); 
document.body.appendChild(renderer.domElement);

// Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ánh sáng xung quanh chiếu sáng toàn bộ scene
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Ánh sáng định hướng, chiếu 1 vật từ 1 hướng
directionalLight.position.set(5, 10, 7.5); // đặt vị trí của ánh sáng định hướng 
scene.add(directionalLight);

// Load file GLTF
const loader = new GLTFLoader();
loader.load('./assets/blender.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-10, 0, 0); // điều chỉnh vị trí của mô hình blender
    scene.add(model);
    console.log('Model loaded:', model);
}, undefined, (error) => {
    console.error('Error loading GLTF:', error);
});

// OrbitControls để xoay và di chuyển trong môi trường 3D
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Hiệu ứng mượt mà khi xoay
controls.dampingFactor = 0.05;

// Hàm resize khi thay đổi kích thước màn hình: điều chỉnh tỷ lệ của khung hình của cam và size của render
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======================== Thiết lập Three.js ========================
scene.background = new THREE.Color(0x6EA6DA); // màu back, màu hexa

const fontLoader = new FontLoader(); // Khởi tạo đúng instance của FontLoader

// ======================== Biến sóng âm ========================
let amplitude = 9.3;
let frequency = 0.43;
let wavelength = 11.63;
let showWaveDiagram = false;
let isAnimating = false;
let waveActive = false;
let waveRadius = 0;
let textMeshX, textMeshY;

// ======================== Tạo sóng âm (particles) ========================
const particles = [];
const particleCount = 27;
const particleSpacing = 2;
const rows = 8;
const rowSpacing = 2;

createParticles();

// ======================== Tạo sóng hình sin ========================
const sinWaveGeometry = new THREE.BufferGeometry();
const sinWaveMaterial = new THREE.LineBasicMaterial({ color: 0xFFFF00 });
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

// Hàm tạo hạt
function createParticles() {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.4, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff, 
                emissive: 0x444444, // Thêm độ sáng nhẹ khi hạt hiện lên
                transparent: true,
                opacity: 0, // Ban đầu ẩn
                metalness: 0.5, // Thêm hiệu ứng sáng mờ cho bề mặt
                roughness: 0.5, // Hiệu ứng mờ
            });
            const particle = new THREE.Mesh(geometry, material);

            // Đặt vị trí ban đầu của hạt theo hàng và cột
            const x = i * particleSpacing;
            const y = j * rowSpacing - (rows * rowSpacing) / 2;
            particle.position.set(x, y, 0);

            // Lưu vị trí gốc và chỉ số cột vào userData để tính toán
            particle.userData.originalPosition = { x, y, z: 0 };
            particle.userData.columnIndex = i; // Lưu lại chỉ số cột để đồng bộ ẩn/hiện theo cột

            particles.push(particle);
            scene.add(particle);
        }
    }
}


// ======================== Hàm animate ========================
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    time += 0.1; // Tăng thời gian để chuyển động mượt hơn

    if (isAnimating) {
        // Cập nhật độ mờ của các hạt theo từng cột, ẩn hiện từ phải sang trái
        particles.forEach((particle) => {
            const columnIndex = particle.userData.columnIndex; // Lấy chỉ số cột từ userData

            // Tạo hiệu ứng ẩn/hiện theo thời gian và cột, từ phải sang trái
            const fadeInOutSpeed = 0.4; // Tốc độ ẩn hiện
            const fadeInOutCycle = Math.sin(time * fadeInOutSpeed - columnIndex * Math.PI / 4); // Điều chỉnh pha theo cột (từ phải sang trái)

            // Đổi độ mờ (opacity) và tạo hiệu ứng mượt mà
            particle.material.opacity = (fadeInOutCycle + 1) / 2; // Đảm bảo độ mờ trong khoảng [0, 1]

            // Thêm hiệu ứng sáng nhẹ khi hiện lên
            particle.material.emissiveIntensity = particle.material.opacity * 0.5; // Độ sáng tăng dần khi opacity tăng
        });
    

        // Cập nhật sóng hình sin nếu bật
        if (showWaveDiagram) {
            time += 0.1;
            for (let i = 0; i <= sinWaveSegments; i++) {
                const x = (i * sinWaveLength / sinWaveSegments) - (time * frequency * 10);
                const y = wavePositionOffset + amplitude * Math.sin(x / wavelength * 2 * Math.PI);
                sinWaveLine.geometry.attributes.position.setY(i, y);
            }
            sinWaveLine.geometry.attributes.position.needsUpdate = true;
        }
    }

    renderer.render(scene, camera);
}

animate();
// Easing function - làm cho quá trình ẩn hiện mượt mà
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

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
    this.textContent = waveActive ? "Dừng" : "Chạy";
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
        { button: document.getElementById("button3"), div: document.getElementById("infoBox3") },
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