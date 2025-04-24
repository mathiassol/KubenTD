import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { initRaycasting } from './raycasterUtils.js';
import { buildWorld } from "./worldElements.js";
import Enemy from './enemy.js';
import Unit from './unit.js';
import { unitConfig } from './unitConfig.js';
import { DamageText } from "./damageText.js";
// Renderer

let isListenerAdded = false;

console.log("mainFrame.js script loaded");

function init() {
    if (!isListenerAdded) {
        window.addEventListener("keydown", handleKeyPress);
        isListenerAdded = true;
    }
}
init()

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
scene.fog = new THREE.Fog( scene.background, 3500, 15000 );
// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
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

buildWorld(scene)

const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({
        color: 'burlywood',
        side: THREE.DoubleSide
    })
);
floorMesh.rotation.x = -Math.PI/2;
floorMesh.position.y = -5;
scene.add(floorMesh);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({ color: 'blue' });
const boxMesh = new THREE.Mesh(geometry, material);
boxMesh.position.z = 10;
scene.add(boxMesh);

const boxMesh2 = new THREE.Mesh(geometry, material);
boxMesh2.position.z = -10;
scene.add(boxMesh2);

let playerHealth = 100;
const healthBar = document.getElementById('health-bar');

function updateHealthBar() {
    healthBar.style.width = `${playerHealth}%`;
    if (playerHealth <= 0) {
    }
}
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
    } else {
        showNotification("Not enough cash");
        shakeCanvas();
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
let cash = 200000;

export function updateCashDisplay() {
    const cashBalanceElement = document.getElementById('cash-balance');
    cashBalanceElement.innerText = `Cash: ${cash}`;
}

export function setCash(newCash) {
    cash = newCash;
    updateCashDisplay();
}

export { cash };


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
const waveConfig = [
    [
        { speed: 5, health: 100, type: 'air', invisible: true, magic: true, steal: false },
    ],
    [
        { speed: 10, health: 40, type: 'air' },
    ],
    [
        { speed: 5, health: 1000, type: 'air' },
    ],
];

function spawnEnemy(path, delay, speed, health, type, invisible, magic, steal) {
    setTimeout(() => {
        const enemy = new Enemy(scene, path, speed, health, type, invisible, magic, steal);
        enemies[enemy.id] = enemy;

        hoverableObjects.push(enemy.enemy);
    }, delay);
}

function spawnWave() {
    const waveData = waveConfig[waveCount];

    const spawnDelay = 1000;

    if (!waveData) {
        console.log("No more waves to spawn!");
        return;
    }

    for (let i = 0; i < waveData.length; i++) {
        if (Object.keys(enemies).length < 100) { // Limit the number of enemies
            const enemyData = waveData[i];
            spawnEnemy(path, i * spawnDelay, enemyData.speed, enemyData.health, enemyData.type, enemyData.invisible, enemyData.magic, enemyData.steal);
        }
    }
    waveCount++;
}

function handleKeyPress(event) {
    if (event.key === "I" || event.key === "i") {
        if (enemyInterval) {
            clearInterval(enemyInterval);
        }

        spawnWave();
    }
    if (event.key === "u" || event.key === "U") {
        Unit.startPlacementMode(scene, camera, 'attacker', (x, y, z, type) => {
            createUnit(x, y, z, type, hoverableObjects);
        });
    }
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
    const material = new THREE.MeshBasicMaterial({ color: 0x3A96FF, side: THREE.DoubleSide, opacity: 0.5, transparent: true });
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
                        <div>Next Upgrade:</div>
                        <div>Damage: ${unitConfig[unit.type][path][unit.pathLevels[path]].damage.toFixed(1)}</div>
                        <div>Range: ${unitConfig[unit.type][path][unit.pathLevels[path]].range.toFixed(1)}</div>
                        <div>Attack Speed: ${unitConfig[unit.type][path][unit.pathLevels[path]].attackSpeed.toFixed(1)}</div>
                        <button class="path-button" data-path="${path}" ${!unit.canUpgradePath(path) ? 'disabled' : ''}>Upgrade Path ${path.slice(-1)}</button>
                    ` : '<div>Max Level Reached</div>'}
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

    // Add range circle
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
            unit.upgradePath(newPath);
            showUnitMenu(unit);
        });
    });

    document.getElementById('sell-button').addEventListener('click', () => {
        const modal = document.getElementById('confirmation-dialog');
        modal.style.display = 'block';

        document.getElementById('confirm-button').onclick = () => {
            removeUnit(unit);
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
        return;
    }

    console.log(`Clicked object at: x=${position.x}, y=${position.y}, z=${position.z}`);

    if (object.userData.isSelectionBox) {
        const unit = object.userData.unit;
        if (unit) {
            if (selectedObject && selectedObject.userData.unit) {
                const previousUnit = selectedObject.userData.unit;
                if (previousUnit.rangeCircle) {
                    scene.remove(previousUnit.rangeCircle);
                    previousUnit.rangeCircle = null;
                }
                const sideMenu = document.getElementById('side-menu');
                sideMenu.style.display = 'none';
            }
            showUnitMenu(unit);
        }
        selectedObject = object;
        return;
    }

    if (selectedObject) {
        const previousEnemy = Object.values(enemies).find(enemy => enemy.enemy.uuid === selectedObject.uuid);
        if (previousEnemy) {
            previousEnemy.healthBar.visible = false;
        }
    }

    selectedUUID = object.uuid;
    selectedObject = object;
    console.log(`Selected UUID: ${selectedUUID}`);

    controls.target.set(position.x, position.y, position.z);
    controls.update();

    const clickedUnit = units.find(unit => unit.mesh.uuid === object.uuid);
    if (clickedUnit) {
        if (selectedObject && selectedObject.userData.unit) {
            const previousUnit = selectedObject.userData.unit;
            if (previousUnit.rangeCircle) {
                scene.remove(previousUnit.rangeCircle);
                previousUnit.rangeCircle = null;
            }
            const sideMenu = document.getElementById('side-menu');
            sideMenu.style.display = 'none';
        }
        showUnitMenu(clickedUnit);
    }

    const clickedEnemy = Object.values(enemies).find(enemy => enemy.enemy.uuid === object.uuid);
    if (clickedEnemy) {
        clickedEnemy.healthBar.visible = true;
    }
}

function updateCamera(scene) {
    if (selectedUUID) {
        const object = scene.getObjectByProperty('uuid', selectedUUID);

        if (object) {

            const targetPosition = object.position.clone();
            targetPosition.y += 5;

            controls.target.lerp(targetPosition, 0.1);
            controls.update();
        } else {
            console.warn("No object found with the stored UUID.");
        }
    }
}

for (let id in enemies) {
    hoverableObjects.push(enemies[id].enemy);
}

function setUnitLevel(unitIndex, newLevel) {
    if (units[unitIndex]) {
        units[unitIndex].setLevel(newLevel);
    }
}

initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick);

const speedFactor = 1;
let frameCount = 0;
const targetFPS = 180;
const frameDuration = 1000 / targetFPS;
let lastFrameTime = 0;

function draw() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= frameDuration) {
        frameCount++;
        const adjustedDeltaTime = clock.getDelta() * speedFactor;

        for (let id in enemies) {
            enemies[id].update(adjustedDeltaTime, onEnemyReachedEnd, camera);
        }

        updateCamera(scene);

        for (let unit of units) {
            unit.update(enemies, adjustedDeltaTime);
        }
        updateCashDisplay();

        renderer.render(scene, camera);
        lastFrameTime = currentTime;
        DamageText.updateAll();
    }

    requestAnimationFrame(draw);
}

renderer.setAnimationLoop(draw);

function logMemoryUsage() {
    console.log(renderer.info.memory);
}
setInterval(logMemoryUsage, 5000);

export { hoverableObjects };

function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

// Event
window.addEventListener('resize', setSize);

document.getElementById("commandInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        let command = this.value.trim();
        executeCommand(command);
        this.value = "";
    }
});
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