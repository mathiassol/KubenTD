import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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
        desynchronized: true
    })
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);


window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light sky blue
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
controls.maxDistance = 150;

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


const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffbb })
);
sun.position.set(100, 150, 100);
sun.castShadow = true;
scene.add(sun);


const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
);
composer.addPass(bloomPass);

const sunLight = new THREE.DirectionalLight(0xfff2cc, 1.1);
sunLight.position.copy(sun.position)
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.radius = 4;
sunLight.shadow.autoUpdate = true;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
sunLight.shadow.bias = -0.000001; // Reduce shadow acne
sunLight.shadow.camera.updateProjectionMatrix();

scene.add(sunLight);

const hemiColor = new THREE.HemisphereLight(0xddeeff, 0x444422, 0.6); // Sky / ground subtle tone
scene.add(hemiColor);


const skyGeo = new THREE.SphereGeometry(5000, 25, 25);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

buildWorld(scene)

const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({
        color: 'burlywood',
        side: THREE.DoubleSide
    }),
    new THREE.ShadowMaterial({ opacity: 0.2 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -5;
floorMesh.receiveShadow = true;
floorMesh.material.polygonOffset = true;
floorMesh.material.polygonOffsetFactor = 1; // Adjust as needed
floorMesh.material.polygonOffsetUnits = 1;
scene.add(floorMesh);
const aoMap = textureLoader.load('textures/AO.jpg');


const geometry = new THREE.BoxGeometry(10, 10, 10);
geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    reflectivity: 0.3,
    depthWrite: true, // Ensure depth is written
    depthTest: true,  // Ensure depth testing
});
const boxMesh = new THREE.Mesh(geometry, material);
boxMesh.position.z = 10;
boxMesh.castShadow = true;
boxMesh.receiveShadow = true;

scene.add(boxMesh);

const boxMesh2 = new THREE.Mesh(geometry, material);
boxMesh2.position.z = -10;
scene.add(boxMesh2);


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

        // Remove selection box
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

const hoverableObjects = [boxMesh2, boxMesh];

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
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(20, 0, 20),
    new THREE.Vector3(40, 0, 0),
    new THREE.Vector3(60, 0, -20),
    new THREE.Vector3(80, 0, 0)
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
let allEnemiesDefeated = true;

function spawnWave() {
    if (waveInProgress) {
        showNotification("Wave already in progress!");
        return;
    }

    if (Object.keys(enemies).length > 0) {
        showNotification("Defeat all enemies before starting next wave!");
        return;
    }

    const waveData = waveConfig[waveCount];
    if (!waveData) {
        console.log("No more waves to spawn!");
        return;
    }

    waveInProgress = true;
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

    // Clean up previous selection
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

    // Find clicked unit
    const clickedUnit = units.find(unit => {
        if (!unit.mesh) return false;
        let current = object;
        while (current) {
            if (current === unit.mesh) return true;
            current = current.parent;
        }
        return false;
    });

    // If clicked on a unit, show menu and range circle
    if (clickedUnit) {
        showUnitMenu(clickedUnit);
        selectedObject = clickedUnit.mesh;
        selectedUUID = clickedUnit.mesh.uuid;
        controls.target.set(position.x, position.y, position.z);
        controls.update();
        return;
    }

    // If clicked elsewhere, clean up
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

initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick, units);
const speedFactor = 1;
let frameCount = 0;
let lastFPSUpdate = performance.now();
let lastFrame = performance.now();
let currentFPS = 0;

function draw() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrame) * 0.001;
    lastFrame = currentTime;

    frameCount++;
    if (currentTime - lastFPSUpdate >= 1000) {
        currentFPS = frameCount;
        document.getElementById('fps').textContent = `FPS: ${currentFPS}`;
        frameCount = 0;
        lastFPSUpdate = currentTime;
    }

    const scaledDelta = deltaTime * speedFactor;

    // Update enemies
    for (let id in enemies) {
        enemies[id].update(scaledDelta, onEnemyReachedEnd, camera);
    }

    // Update units
    units.forEach(unit => {
        if (unit && unit.mesh && unit.mesh.visible) {
            const nearbyEnemies = Object.values(enemies).filter(enemy => {
                if (enemy && enemy.enemy) {
                    const distance = unit.mesh.position.distanceTo(enemy.enemy.position);
                    return distance <= unit.range;
                }
                return false;
            });
            unit.update(nearbyEnemies, deltaTime);
        }
    });

    updateCamera(scene);
    cleanupScene();
    renderer.render(scene, camera);
    composer.render();

    DamageText.updateAll();
}

function animate() {
    requestAnimationFrame(animate);
    draw();
}
animate();

function logMemoryUsage() {
    console.log(renderer.info.memory);
}
setInterval(logMemoryUsage, 5000);

export { hoverableObjects };

function setSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update renderer and
    renderer.setSize(width, height);

    // Reset pixel ratio if needed
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