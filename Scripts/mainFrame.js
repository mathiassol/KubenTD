import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const noise = new Noise(Math.random());
import {initRaycasting} from './raycasterUtils.js';
import {buildWorld} from "./worldElements.js";

import Enemy from './enemy.js';
import Unit from './unit.js';
import {unitConfig} from './unitConfig.js';
import {easyWaveConfig, normalWaveConfig, hardWaveConfig} from "./enemyConfig.js";
import {DamageText} from "./damageText.js";
const cashSound = new Audio('SFX/cash.ogg');
cashSound.volume = 0.1;
cashSound.speed = 1.5;

const NOSound = new Audio('SFX/click-NO.ogg');
cashSound.volume = 0.1;
cashSound.speed = 1.1;

function playCashSound() {
    cashSound.currentTime = 0;
    cashSound.play().catch(error => console.log("Audio play failed:", error));
}
let cash = 0;

let isListenerAdded = false;

console.log("mainFrame.js script loaded");

function init() {
    if (!isListenerAdded) {
        window.addEventListener("keydown", handleKeyPress);
        isListenerAdded = true;
    }
}
init()

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    context: canvas.getContext('webgl2', {
        powerPreference: 'high-performance',
        desynchronized: true,
        depth: true,
        stencil: true
    })
});

const width = window.innerWidth;
const height = window.innerHeight;

renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.frustumCulled = true;

document.body.appendChild(renderer.domElement);

const pauseMenuHTML = `
<div id="pause-menu" class="pause-menu hidden">
    <div class="pause-content">
        <h2>Game Paused</h2>
        <div class="preference-section">
            <h3>Graphics</h3>
            <div class="preference-item">
                <label>postprocessing (heavy GPU load)</label>
                <input type="checkbox" id="postProcessing-toggle" checked>
            </div>
            <div class="preference-item">
                <label>Shadow Quality</label>
                <select id="shadow-quality">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high" selected>High</option>
                    <option value="extreme" >extreme</option>
                </select>
            </div>
               <div class="preference-item">
                <label>Time Cycle</label>
                <select id="time-cycle">
                    <option value="day">Always Day</option>
                    <option value="night">Always Night</option>
                    <option value="cycle">Day/Night Cycle</option>
                </select>
            </div>
        </div>
        <div class="preference-section">
            <h3>Audio</h3>
            <div class="preference-item">
                <label>Master Volume</label>
                <input type="range" id="master-volume" min="0" max="100" value="100">
            </div>
            <div class="preference-item">
                <label>SFX Volume</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="100">
            </div>
        </div>
        <div class="button-group">
            <button id="resume-button">Resume Game</button>
            <button id="main-menu-button">Main Menu</button>
        </div>
    </div>
</div>
`;

const pauseMenuCSS = `
.pause-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.pause-menu.hidden {
    display: none;
}

.pause-content {
    background: linear-gradient(145deg, #323232, #252525);
    padding: 2.5rem;
    border-radius: 16px;
    min-width: 380px;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.preference-section {
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.preference-section h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: #4a9eff;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.preference-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.8rem 0;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.preference-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 1.2rem;
    margin-top: 2.5rem;
}

.pause-menu button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: linear-gradient(145deg, #4a9eff, #2e7fd9);
    color: white;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

.pause-menu button:hover {
    background: linear-gradient(145deg, #5ba8ff, #3d8ce8);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(74, 158, 255, 0.3);
}

.pause-menu button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(74, 158, 255, 0.2);
}
`;

let isPaused = false;
let postProcessingEnabled = true;

function initPauseMenu() {
    document.body.insertAdjacentHTML('beforeend', pauseMenuHTML);
    const style = document.createElement('style');
    style.textContent = pauseMenuCSS;
    document.head.appendChild(style);

    const pauseMenu = document.getElementById('pause-menu');
    const resumeButton = document.getElementById('resume-button');
    const postProcessingToggle = document.getElementById('postProcessing-toggle');
    const shadowQuality = document.getElementById('shadow-quality');
    const dayNightToggle = document.getElementById('daynight-toggle');
    const masterVolume = document.getElementById('master-volume');
    const sfxVolume = document.getElementById('sfx-volume');

    // Event handlers
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
        }
    });

    resumeButton.addEventListener('click', togglePause);

    postProcessingToggle.addEventListener('change', (e) => {
        postProcessingEnabled = e.target.checked;
    });

    shadowQuality.addEventListener('change', (e) => {
        switch (e.target.value) {
            case 'low':
                sunLight.shadow.mapSize.width = 206;
                sunLight.shadow.mapSize.height = 206;
                moonLight.shadow.mapSize.width = 206;
                moonLight.shadow.mapSize.height = 206;
                break;
            case 'medium':
                sunLight.shadow.mapSize.width = 512;
                sunLight.shadow.mapSize.height = 512;
                moonLight.shadow.mapSize.width = 512;
                moonLight.shadow.mapSize.height = 512;
                break;
            case 'high':
                sunLight.shadow.mapSize.width = 1024;
                sunLight.shadow.mapSize.height = 1024;
                moonLight.shadow.mapSize.width = 1024;
                moonLight.shadow.mapSize.height = 1024;
                break;
            case 'extreme':
                sunLight.shadow.mapSize.width = 4096;
                sunLight.shadow.mapSize.height = 4096;
                moonLight.shadow.mapSize.width = 4096;
                moonLight.shadow.mapSize.height = 4096;
                break;
        }

        if (sunLight.shadow.map) {
            sunLight.shadow.map.dispose();
            sunLight.shadow.map = null;
        }
        if (moonLight.shadow.map) {
            moonLight.shadow.map.dispose();
            moonLight.shadow.map = null;
        }

        renderer.shadowMap.needsUpdate = true;
    });


    const timeCycle = document.getElementById('time-cycle');
    timeCycle.value = localStorage.getItem('timeCycle') || 'cycle';

    timeCycle.addEventListener('change', (e) => {
        localStorage.setItem('timeCycle', e.target.value);
        timeOfDay = e.target.value === 'day' ? 0.25 : e.target.value === 'night' ? 0.75 : timeOfDay;
    });

    masterVolume.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
    });

    sfxVolume.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        cashSound.volume = volume;
        NOSound.volume = volume;
    });
}

function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pause-menu');

    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
    }
}

initPauseMenu();

document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 3000);
});

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.y = 30;
camera.position.z = 50;
scene.add(camera);

// camera clamping
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI * 0.04;
controls.maxPolarAngle = Math.PI * 0.48;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 250;

const textureLoader = new THREE.TextureLoader();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = textureLoader.load('textures/hdr.hdr', (tex) => {
    const envMap = pmremGenerator.fromEquirectangular(tex).texture;
    scene.environment = envMap;
    tex.dispose();
    pmremGenerator.dispose();
});

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        samples: 3 // MSAA
    }
);
composer.setSize(renderTarget.width, renderTarget.height);
const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
outlinePass.edgeStrength = 1;
outlinePass.edgeGlow = 0.0;
outlinePass.edgeThickness = 1.0;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#000000');
composer.addPass(outlinePass);

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffbb })
);
sun.position.set(200, 300, 200);
scene.add(sun);

const dayDuration = 20;
let timeOfDay = 0;

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xbbccff })
);
moon.position.set(-200, -300, -200);
scene.add(moon);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0,
    0,
    1
);
composer.addPass(bloomPass);

const sunLight = new THREE.DirectionalLight(0xfff2cc, 0.1);
sunLight.position.copy(sun.position)
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 514;
sunLight.shadow.mapSize.height = 514;
sunLight.shadow.radius = 1;
sunLight.shadow.autoUpdate = true;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 1500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
sunLight.shadow.bias = -0.00005;
sunLight.shadow.camera.updateProjectionMatrix();

scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

const watergeo = new THREE.PlaneGeometry(2000, 2000, 30, 30);
watergeo.rotateX(-Math.PI / 2);

const waterShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uColor: { value: new THREE.Color(0x06ad9b) },
        uTime: { value: 0.0 },
        uFadeDistance: { value: 850.0 }
    },
    vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            vec3 newPosition = position;
            newPosition.y += sin(position.x * 0.1 + uTime) * 0.5;
            newPosition.y += sin(position.z * 0.1 + uTime) * 0.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        uniform float uFadeDistance;
        varying vec3 vPosition;
        void main() {
            float distanceFromCenter = length(vPosition.xz);
            float alpha = 1.0 - smoothstep(0.0, uFadeDistance, distanceFromCenter);
            gl_FragColor = vec4(uColor, alpha);
        }
    `,
    transparent: true
});

const water = new THREE.Mesh(watergeo, waterShaderMaterial)

water.position.set(0, -14, 0);
water.receiveShadow = true;
scene.add(water);

function updateWaterAnimation(deltaTime) {
    const waveScaling = 30;
    const time = clock.getElapsedTime();


    for (let i = 0; i < watergeo.attributes.position.count; i++) {
        const x = watergeo.attributes.position.getX(i);
        const z = watergeo.attributes.position.getZ(i);

        const distance = Math.sqrt(x * x + z * z);
        const scaleFactor = 1 + (distance / 1000) * waveScaling;

        const frequency = 0.01;
        const y = noise.simplex3(x * frequency, z * frequency, time * 0.1) * scaleFactor;

        watergeo.attributes.position.setY(i, y);
    }
    watergeo.attributes.position.needsUpdate = true;
}

scene.background = new THREE.Color(0x87ceeb);

const skyGeo = new THREE.SphereGeometry(5000, 25, 25);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);



buildWorld(scene)

const loader = new GLTFLoader();
loader.load(
    'maps/map-ground.glb',
    (gltf) => {
        const map = gltf.scene;
        map.position.set(0, -14.9, 0);
        map.scale.set(25, 25, 25);
        scene.add(map);
        console.log('Map ground loaded successfully');

        map.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
            }
        });
    },
    (xhr) => {
        console.log(`Map ground loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
        console.error('An error occurred while loading the map ground:', error);
    }
);

loader.load(
    'maps/map-top.glb',
    (gltf) => {
        const map = gltf.scene;
        map.position.set(0, -14.9, 0);
        map.scale.set(25, 25, 25);
        scene.add(map);
        console.log('Map top loaded successfully');

        map.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    },
    (xhr) => {
        console.log(`Map top loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
        console.error('An error occurred while loading the map top:', error);
    }
);

const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshLambertMaterial({

    }),
    new THREE.ShadowMaterial({ opacity: 0.2 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.set(-60, -5, -10);
floorMesh.visible = false;
floorMesh.receiveShadow = true;
floorMesh.material.polygonOffset = true;
floorMesh.material.polygonOffsetFactor = 1; // Adjust as needed
floorMesh.material.polygonOffsetUnits = 1;
scene.add(floorMesh);



const geometry = new THREE.BoxGeometry(10, 10, 10);
geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 1,
});



function cleanupScene() {
    for (const id in enemies) {
        if (!enemies[id].enemy.visible || enemies[id].health <= 0) {
            scene.remove(enemies[id].enemy);
            enemies[id].enemy.geometry.dispose();
            enemies[id].enemy.material.dispose();
            delete enemies[id];
        }
    }
}

let playerHealth = 100;
const healthBar = document.getElementById('health-bar');

function updateHealthBar() {
    healthBar.style.width = `${playerHealth}%`;
    healthBar.style.backgroundColor = playerHealth > 50 ? 'green' : playerHealth > 20 ? 'yellow' : 'red';
    healthBar.innerText = `${playerHealth}/100`;
    if (playerHealth <= 0) {}
}
updateHealthBar()
const units = [];

function removeUnit(unit) {
    const index = units.indexOf(unit);
    if (index > -1) {
        units.splice(index, 1);
        const hoverIndex = hoverableObjects.indexOf(unit.mesh);
        if (hoverIndex > -1) {
            hoverableObjects.splice(hoverIndex, 1);
        }
        if (unit.mesh) {
            scene.remove(unit.mesh);
            if (unit.mesh.geometry) {
                unit.mesh.geometry.dispose();
            }
            if (unit.mesh.material) {
                unit.mesh.material.dispose();
            }
        }

        const selectionBox = unit.hoverableObjects.find(obj => obj.userData.isSelectionBox);
        if (selectionBox) {
            scene.remove(selectionBox);
            if (selectionBox.geometry) {
                selectionBox.geometry.dispose();
            }
            if (selectionBox.material) {
                selectionBox.material.dispose();
            }
        }

        const unitCost = unitConfig[unit.type].price;
        let totalSpent = unitCost;
        for (const path in unit.pathLevels) {
            const level = unit.pathLevels[path];
            for (let i = 0; i < level; i++) {
                totalSpent += unitConfig[unit.type][path][i].upgradePrice;
            }
        }
        const refund = totalSpent * 0.5;
        setCash(cash + refund);
    }
}

const hoverableObjects = [];

function createUnit(x, y, z, type) {
    const unitCost = unitConfig[type].price;
    if (cash >= unitCost) {
        const unit = new Unit(scene, x, y, z, type, hoverableObjects);
        units.push(unit);
        cash -= unitCost;
        updateCashDisplay();
        playCashSound()
    } else {
        showNotification("Not enough cash");
        shakeCanvas();
        NOSound.currentTime = 0;
        NOSound.play().catch(error => console.log("Audio play failed:", error));
    }
}

function shakeCanvas() {
    const canvas = document.querySelector('#three-canvas');
    canvas.classList.add('shake');
    setTimeout(() => {
        canvas.classList.remove('shake');
    }, 500);
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
let lastCashUpdate = 0;
let lastCashValue = cash;
const CASH_UPDATE_INTERVAL = 100;

export function updateCashDisplay() {
    const currentTime = performance.now();

    if (cash !== lastCashValue && currentTime - lastCashUpdate > CASH_UPDATE_INTERVAL) {
        const cashBalanceElement = document.getElementById('cash-balance');
        cashBalanceElement.innerText = `Cash: ${cash}`;
        lastCashUpdate = currentTime;
        lastCashValue = cash;
    }
}

export function setCash(newCash) {
    cash = newCash;
    const cashBalanceElement = document.getElementById('cash-balance');
    cashBalanceElement.innerText = `Cash: ${cash}`;
    lastCashValue = cash;
    lastCashUpdate = performance.now();
}

export {
    cash
};


// Draw
const clock = new THREE.Clock();

const path = [
    new THREE.Vector3(-63.60, 0, 61.47),
    new THREE.Vector3(-63.06, 0, 26.15),
    new THREE.Vector3(-13.43, 0, 25.67),
    new THREE.Vector3(-12.20, 0, 74.21),
    new THREE.Vector3(34.69, 0, 71.29),
    new THREE.Vector3(39.90, 0, -24.54),
    new THREE.Vector3(87.04, 0, -28.24),
    new THREE.Vector3(86.72, 0, -49.15),
    new THREE.Vector3(-36.83, 0, -53.82),
    new THREE.Vector3(-37.33, 0, -100.13),
    new THREE.Vector3(13.01, 0, -100.60),
    new THREE.Vector3(11.60, 0, -26.48),
    new THREE.Vector3(-59.73, 0, -26.09)
];
let waveCount = 0;
let enemies = {};
let enemyInterval = null;

// Wave index

async function getSettingsValue(section, key) {
    try {
        const response = await fetch('settings.ini');
        const text = await response.text();
        const lines = text.split('\n');

        let currentSection = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                currentSection = trimmedLine.slice(1, -1);
            } else if (currentSection === section && trimmedLine.includes('=')) {
                const [settingKey, value] = trimmedLine.split('=').map(s => s.trim());
                if (settingKey === key) {
                    return value;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error reading settings:', error);
        return null;
    }
}

let waveConfig = easyWaveConfig;

getSettingsValue('game', 'difficulty').then(difficulty => {
    if (difficulty === 'easy') {
        waveConfig = easyWaveConfig;
        cash = 1000;
        const cashBalanceElement = document.getElementById('cash-balance');
        cashBalanceElement.innerText = `Cash: ${cash}`;
    }if (difficulty === 'normal') {
        waveConfig = normalWaveConfig;
        cash = 800;
        const cashBalanceElement = document.getElementById('cash-balance');
        cashBalanceElement.innerText = `Cash: ${cash}`;
    }if (difficulty === 'hard') {
        waveConfig = hardWaveConfig;
        cash = 600;
        const cashBalanceElement = document.getElementById('cash-balance');
        cashBalanceElement.innerText = `Cash: ${cash}`;
    }
});

function spawnEnemy(path, delay, speed, health, type, invisible, magic, steal, cash) {
    setTimeout(() => {
        const enemy = new Enemy(scene, path, speed, health, type, invisible, magic, steal, cash);
        enemies[enemy.id] = enemy;
        hoverableObjects.push(enemy.enemy);
    }, delay);
}

let waveInProgress = false;
const waveInfoElement = document.getElementById('wave-info');

function updateWaveInfo() {
    const totalWaves = waveConfig.length;
    waveInfoElement.textContent = `Wave: ${waveCount + 1}/${totalWaves}`;
}

const sideMenu = document.getElementById('side-menu');
const commanderContainer = document.getElementById('commander-container');

const observer = new MutationObserver(() => {
    if (sideMenu.style.display === 'block') {
        commanderContainer.style.right = '260px';
    } else {
        commanderContainer.style.right = '20px';
    }
});

observer.observe(sideMenu, { attributes: true, attributeFilter: ['style'] });


function showCommander(message) {
    const commanderContainer = document.getElementById('commander-container');
    const chatBubble = document.getElementById('chat-bubble');

    chatBubble.textContent = message;
    commanderContainer.classList.remove('hidden');

    setTimeout(() => {
        commanderContainer.classList.add('hidden');
    }, 5000);
}


function spawnWave() {
    if (waveInProgress) {
        showNotification("Wave already in progress!");
        return;
    }
    const commanderContainer = document.getElementById('commander-container');
    commanderContainer.classList.add('hidden');

    if (Object.keys(enemies).length > 0) {
        showNotification("Defeat all enemies before starting next wave!");
        return;
    }

    const waveData = waveConfig[waveCount];
    if (!waveData) {
        console.log("No more waves to spawn!");
        return;
    }

    if (waveCount+1 === 5) {
        showCommander("Brace yourselves! Wave 5 is here!");
    } else if (waveCount+1 === 10) {
        showCommander("Wave 10! Stay strong, commander!");
    }

    waveInProgress = true;
    updateWaveInfo();
    let enemiesSpawned = 0;
    const totalEnemies = waveData.length;

    for (let i = 0; i < waveData.length; i++) {
        if (Object.keys(enemies).length < 100) {
            const enemyData = waveData[i];
            setTimeout(() => {
                spawnEnemy(path, 0, enemyData.speed, enemyData.health,
                    enemyData.type, enemyData.invisible, enemyData.magic,
                    enemyData.steal, enemyData.cash);
                enemiesSpawned++;

                if (enemiesSpawned === totalEnemies) {
                    const checkInterval = setInterval(() => {
                        if (Object.keys(enemies).length === 0) {
                            waveInProgress = false;
                            showNotification("Wave completed!");
                            clearInterval(checkInterval);
                        }
                    }, 1000);
                }
            }, i * 1000);
        }
    }
    waveCount++;
}
const startWaveButton = document.getElementById("start-wave-btn")

startWaveButton.addEventListener('click', () => {
    spawnWave()
});
updateWaveInfo();

function handleKeyPress(event) {
    if (event.key === 'Shift' && event.location === 1) {
        controls.target.set(0, 3, 0)

        selectedUUID = null;
        selectedObject = null;
        controls.update();
    }
    const prompt = document.getElementById("commandPrompt");
    const input = document.getElementById("commandInput");

    if (event.key === "Tab") {
        event.preventDefault();
        if (prompt.style.bottom === "0px") {
            prompt.style.bottom = "-100px";
            input.value = "";
        } else {
            prompt.style.bottom = "0";
            input.focus();
        }
    }
    if (event.key === "Escape") {
        prompt.style.bottom = "-100px";
        input.value = "";
    }
}

function onEnemyReachedEnd(enemy) {
    playerHealth -= enemy.health;

    if (playerHealth < 0) {
        playerHealth = 0;
    }
    updateHealthBar();

    scene.remove(enemy.enemy);
    delete enemies[enemy.id];

}

function createRangeCircle(unit) {
    const geometry = new THREE.CircleGeometry(unit.range, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x3A96FF,
        side: THREE.DoubleSide,
        opacity: 0.5,
        transparent: true
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.rotation.x = -Math.PI / 2;
    circle.position.copy(unit.mesh.position);
    circle.position.y = -4.85;
    scene.add(circle);
    return circle;
}

function showUnitMenu(unit) {
    const sideMenu = document.getElementById('side-menu');
    sideMenu.style.display = 'block';

    sideMenu.innerHTML = `
        <button id="close-button" class="close-button">&times;</button>
        <h3>${unit.type}</h3>
        ${['path1', 'path2', 'path3'].map(path => `
            <div class="path-box">
                <div class="path-level">Level ${unit.pathLevels[path]}</div>
                <div class="path-upgrade">
                    ${unitConfig[unit.type][path][unit.pathLevels[path]] ? `
                        <div id="text1">Next Upgrade:</div>
                        <div id="text1">Damage: ${unitConfig[unit.type][path][unit.pathLevels[path]].damage.toFixed(1)}</div>
                        <div id="text1">Range: ${unitConfig[unit.type][path][unit.pathLevels[path]].range.toFixed(1)}</div>
                        <div id="text1">Attack Speed: ${unitConfig[unit.type][path][unit.pathLevels[path]].attackSpeed.toFixed(1)}</div>
                        <button class="path-button" data-path="${path}" ${!unit.canUpgradePath(path) ? 'disabled' : ''}>Upgrade Path ${path.slice(-1)}</button>
                    ` : '<div id="text1">Max Level Reached</div>'}
                </div>
            </div>
        `).join('')}
        <div class="current-stats">
            <h4>Current Stats:</h4>
            <div>Damage: ${unit.damage.toFixed(1)}</div>
            <div>Range: ${unit.range.toFixed(1)}</div>
            <div>Attack Speed: ${unit.attackSpeed.toFixed(1)}</div>
        </div>
        <button id="sell-button" class="sell-button">Sell Unit</button>
    `;

    if (unit.rangeCircle) {
        scene.remove(unit.rangeCircle);
    }
    unit.rangeCircle = createRangeCircle(unit);

    document.getElementById('close-button').addEventListener('click', () => {
        sideMenu.style.display = 'none';
        if (unit.rangeCircle) {
            scene.remove(unit.rangeCircle);
            unit.rangeCircle = null;
        }
    });

    document.querySelectorAll('.path-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const newPath = event.target.getAttribute('data-path');
            const upgradeCost = unitConfig[unit.type][newPath][unit.pathLevels[newPath]]?.upgradePrice;

            if (cash >= upgradeCost) {
                unit.upgradePath(newPath);
                playCashSound();
            } else {
                NOSound.currentTime = 0;
                NOSound.play().catch(error => console.log("Audio play failed:", error));
                showNotification("Not enough cash!");
                shakeCanvas();
            }
            showUnitMenu(unit);
        });
    });

    document.getElementById('sell-button').addEventListener('click', () => {
        const modal = document.getElementById('confirmation-dialog');
        modal.style.display = 'block';

        document.getElementById('confirm-button').onclick = () => {
            removeUnit(unit);
            playCashSound();
            sideMenu.style.display = 'none';
            modal.style.display = 'none';
            if (unit.rangeCircle) {
                scene.remove(unit.rangeCircle);
                unit.rangeCircle = null;
            }
        };

        document.getElementById('cancel-button').onclick = () => {
            modal.style.display = 'none';
        };
    });
}

let selectedUUID = null;
let selectedObject = null;

function generateUnitMenu() {
    const unitsContainer = document.getElementById('units');
    unitsContainer.innerHTML = '';

    for (const unitType in unitConfig) {
        const unit = unitConfig[unitType];
        const unitElement = document.createElement('div');
        unitElement.className = 'unit';
        unitElement.dataset.target = unit.target || 'ground';

        const unitImage = document.createElement('img');
        unitImage.src = `units/${unitType}.png`;
        unitImage.alt = `${unitType} Unit`;

        const unitPrice = document.createElement('div');
        unitPrice.className = 'price';
        unitPrice.textContent = `$${unit.price}`;

        unitElement.appendChild(unitImage);
        unitElement.appendChild(unitPrice);
        unitsContainer.appendChild(unitElement);

        unitElement.addEventListener('click', () => {
            console.log(`Unit ${unitType} clicked`);
            Unit.startPlacementMode(scene, camera, unitType, (x, y, z, type) => {
                createUnit(x, y, z, type, hoverableObjects);
                console.log(hoverableObjects);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateUnitMenu();
});

function handleObjectClick(position, object) {
    if (!object) {
        console.warn("Clicked object is undefined.");
        // Clean up any open menus and range circles
        const sideMenu = document.getElementById('side-menu');
        sideMenu.style.display = 'none';

        // Remove range circles from all units
        units.forEach(unit => {
            if (unit.rangeCircle) {
                scene.remove(unit.rangeCircle);
                unit.rangeCircle = null;
            }
        });
        return;
    }

    const sideMenu = document.getElementById('side-menu');

    if (selectedObject) {
        if (selectedObject.userData && selectedObject.userData.unit) {
            const previousUnit = selectedObject.userData.unit;
            if (previousUnit.rangeCircle) {
                scene.remove(previousUnit.rangeCircle);
                previousUnit.rangeCircle = null;
            }
        }
        const previousEnemy = Object.values(enemies).find(enemy => enemy.enemy.uuid === selectedObject.uuid);
        if (previousEnemy) {
            previousEnemy.healthBar.visible = false;
        }
    }

    const clickedUnit = units.find(unit => {
        if (!unit.mesh) return false;
        let current = object;
        while (current) {
            if (current === unit.mesh) return true;
            current = current.parent;
        }
        return false;
    });

    if (clickedUnit) {
        showUnitMenu(clickedUnit);
        selectedObject = clickedUnit.mesh;
        selectedUUID = clickedUnit.mesh.uuid;
        controls.target.set(position.x, position.y, position.z);
        controls.update();
        return;
    }

    sideMenu.style.display = 'none';
    units.forEach(unit => {
        if (unit.rangeCircle) {
            scene.remove(unit.rangeCircle);
            unit.rangeCircle = null;
        }
    });

    selectedObject = object;
    selectedUUID = object.uuid;
    controls.target.set(position.x, position.y, position.z);
    controls.update();

    const clickedEnemy = Object.values(enemies).find(enemy => enemy.enemy.uuid === object.uuid);
    if (clickedEnemy) {
        clickedEnemy.healthBar.visible = true;
    }
}

let cameraNeedsUpdate = false;
let lastCameraPosition = new THREE.Vector3();
let lastControlsTarget = new THREE.Vector3();

function updateCamera(scene) {
    if (!selectedUUID && !cameraNeedsUpdate) {
        return;
    }

    if (selectedUUID) {
        const object = scene.getObjectByProperty('uuid', selectedUUID);
        if (object) {
            const targetPosition = object.position.clone();
            targetPosition.y += 5;

            if (controls.target.distanceTo(targetPosition) > 0.01) {
                controls.target.lerp(targetPosition, 0.1);
                cameraNeedsUpdate = true;
            }
        }
    }

    if (!camera.position.equals(lastCameraPosition) || !controls.target.equals(lastControlsTarget)) {
        controls.update();
        lastCameraPosition.copy(camera.position);
        lastControlsTarget.copy(controls.target);
        cameraNeedsUpdate = false;
    }
}

controls.addEventListener('start', () => {
    cameraNeedsUpdate = true;
});

controls.addEventListener('end', () => {
    cameraNeedsUpdate = false;
});

for (let id in enemies) {
    hoverableObjects.push(enemies[id].enemy);
}

function setUnitLevel(unitIndex, newLevel) {
    if (units[unitIndex]) {
        units[unitIndex].setLevel(newLevel);
    }
}


let currentlyHighlighted = null;

function handleObjectHover(object) {
    if (currentlyHighlighted !== object) {
        if (currentlyHighlighted) {
            outlinePass.selectedObjects = [];
        }
        if (object) {
            outlinePass.selectedObjects = [object];
        }
        currentlyHighlighted = object;
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hoverableObjects.slice(0, 50), true);

    if (intersects.length > 0) {
        handleObjectHover(intersects[0].object);
    } else {
        handleObjectHover(null);
    }
});

initRaycasting(scene, camera, floorMesh, hoverableObjects, (position, object) => {
    handleObjectClick(position, object);
    handleObjectHover(object);
}, units);

const moonLight = new THREE.DirectionalLight(0xfff2cc, 0.1);
moonLight.position.copy(moon.position)
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 516;
moonLight.shadow.mapSize.height = 516;
moonLight.shadow.radius = 2;
moonLight.shadow.autoUpdate = true;
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 1000;
moonLight.shadow.camera.left = -130;
moonLight.shadow.camera.right = 130;
moonLight.shadow.camera.top = 130;
moonLight.shadow.camera.bottom = -130;
moonLight.shadow.bias = -0.00001;
moonLight.shadow.camera.updateProjectionMatrix();
scene.add(moonLight);



function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0
    });

    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        let x, y, z, distance;
        do {
            x = (Math.random() - 0.5) * 5000; // X
            y = Math.random() * 2000; // Y
            z = (Math.random() - 0.5) * 5000; // Z
            distance = Math.sqrt(x * x + y * y + z * z);
        } while (distance < 600);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
}

const stars = createStars();
scene.add(stars);

function updateDayNightCycle(deltaTime) {
    const cycleMode = localStorage.getItem('timeCycle') || 'cycle';

    if (cycleMode === 'cycle') {
        timeOfDay += deltaTime / dayDuration;
        if (timeOfDay > 1) timeOfDay -= 1;
    } else if (cycleMode === 'day') {
        timeOfDay = 0.20; // Midday
    } else if (cycleMode === 'night') {
        timeOfDay = 0.86; // Midnight
    }

    const angle = timeOfDay * Math.PI * 2;

    sunLight.position.set(
        Math.cos(angle) * 300,
        Math.sin(angle) * 300,
        0
    );
    sun.position.copy(sunLight.position);

    moonLight.position.set(
        Math.cos(angle + Math.PI) * 300,
        Math.sin(angle + Math.PI) * 300,
        0
    );
    moon.position.copy(moonLight.position);

    sun.visible = sun.position.y > -25;
    moon.visible = moon.position.y > -25;

    const sunIntensity = Math.max(0, Math.sin(angle)) * 0.8;
    const moonIntensity = Math.max(0, Math.sin(angle + Math.PI)) * 0.4;

    sunLight.intensity = sunIntensity;
    moonLight.intensity = moonIntensity;

    const skyColor = new THREE.Color().lerpColors(
        new THREE.Color(0x000022),
        new THREE.Color(0x87ceeb),
        Math.max(sunIntensity, 0.1)
    );
    scene.background = skyColor;

    stars.material.opacity = 1 - sunIntensity;

    const dayWaterColor = new THREE.Color(0x055e55);
    const nightWaterColor = new THREE.Color(0x06ad9b);
    waterShaderMaterial.uniforms.uColor.value = new THREE.Color().lerpColors(
        nightWaterColor,
        dayWaterColor,
        sunIntensity
    );
}

const speedFactor = 1;
let frameCount = 0;
let lastFPSUpdate = performance.now();
let lastFrame = performance.now();
let currentFPS = 0;
let waterUpdateTimer = 0;

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(floorMesh);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        controls.target.set(point.x, point.y, point.z);
        controls.update();
    }
});

const keybinds = [
    { icon: '\uE0C0', text: 'Center Cam' },
    { icon: '\uE0E8', text: 'move camera' },
];

const keybindContainer = document.getElementById('keybind-showcase');

keybinds.forEach(keybind => {
    const keybindElement = document.createElement('div');
    keybindElement.className = 'keybind';

    const iconElement = document.createElement('span');
    iconElement.className = 'icon';
    iconElement.textContent = keybind.icon;

    const textElement = document.createElement('span');
    textElement.className = 'text';
    textElement.textContent = keybind.text;

    keybindElement.appendChild(iconElement);
    keybindElement.appendChild(textElement);
    keybindContainer.appendChild(keybindElement);
});

let gameSpeed = 1;

function draw() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrame) * 0.001;
    lastFrame = currentTime;
    frameCount++;


    waterUpdateTimer += deltaTime;
    if (waterUpdateTimer >= 0.1) {
        updateWaterAnimation(deltaTime);
        waterUpdateTimer = 0;
    }
    if (frameCount % 2 === 0) {
        updateDayNightCycle(deltaTime);
    }
    if (currentTime - lastFPSUpdate >= 1000) {
        currentFPS = frameCount;
        document.getElementById('fps').textContent = `FPS: ${currentFPS}`;
        frameCount = 0;
        lastFPSUpdate = currentTime;
    }

    const scaledDelta = deltaTime * speedFactor;
    for (let id in enemies) {
        enemies[id].update(deltaTime * gameSpeed, onEnemyReachedEnd, camera);
    }
    units.forEach(unit => {
        if (unit && unit.mesh && unit.mesh.visible) {
            const nearbyEnemies = Object.values(enemies).filter(enemy => {
                if (enemy && enemy.enemy) {
                    const distance = unit.mesh.position.distanceTo(enemy.enemy.position);
                    return distance <= unit.range;
                }
                return false;
            });
            unit.update(nearbyEnemies, deltaTime * gameSpeed);
        }
    });

    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            playClickSound();
            speedButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameSpeed = parseFloat(this.getAttribute('data-speed'));
        });
    });

    updateCamera(scene);
    cleanupScene();
    if (postProcessingEnabled === true) {
        composer.render();
    }else{
        renderer.render(scene, camera);
    }

    DamageText.updateAll();
}

function animate() {
    requestAnimationFrame(animate);
    if (!isPaused) {
        draw();
    }
}
animate();



export { hoverableObjects };

function setSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    const pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    renderer.setPixelRatio(pixelRatio);
}


// Event
window.addEventListener('resize', setSize);

function executeCommand(command) {
    switch (true) {
        case command === "help":
            alert("Available commands: help, hello, reload, setDamage <unitIndex> <newDamage>, setLevel <unitIndex> <newLevel>");
            break;
        case command === "hello":
            alert("Hello there!");
            break;
        case command === "reload":
            window.location.reload(true);
            break;
        case command.startsWith("setdamage"):
            const damageArgs = command.split(" ");
            if (damageArgs.length === 3) {
                const unitIndex = parseInt(damageArgs[1], 10);
                const newDamage = parseInt(damageArgs[2], 10);
                if (!isNaN(unitIndex) && !isNaN(newDamage) && units[unitIndex]) {
                    units[unitIndex].setDamage(newDamage);
                    console.log(`Unit ${unitIndex} damage set to ${newDamage}`);
                } else {
                    console.log("Invalid command arguments");
                }
            } else {
                console.log("Invalid command format");
            }
            break;
        case command.startsWith("setLevel"):
            const levelArgs = command.split(" ");
            if (levelArgs.length === 3) {
                const unitIndex = parseInt(levelArgs[1], 10);
                const newLevel = parseInt(levelArgs[2], 10);
                if (!isNaN(unitIndex) && !isNaN(newLevel) && units[unitIndex]) {
                    setUnitLevel(unitIndex, newLevel);
                    console.log(`Unit ${unitIndex} level set to ${newLevel}`);
                } else {
                    console.log("Invalid command arguments");
                }
            } else {
                console.log("Invalid command format");
            }
            break;
        case command.startsWith("setcash"):
            const cashArgs = command.split(" ");
            if (cashArgs.length === 2) {
                const newCash = parseInt(cashArgs[1], 10);
                if (!isNaN(newCash)) {
                    setCash(newCash);
                    console.log(`Cash set to ${newCash}`);
                } else {
                    console.log("Invalid command arguments");
                }
            } else {
                console.log("Invalid command format");
            }
            break;
        default:
    }
}