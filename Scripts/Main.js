import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { initRaycasting } from './raycasterUtils.js';
import { buildWorld } from "./worldElements.js";
import Enemy from './enemy.js';
import Unit from './unit.js';
// Renderer
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

window.addEventListener('keydown', function(event) {
    if (event.key === 'Shift' && event.location === 1) {
        controls.target.set(0, 3, 0)

        selectedUUID = null;
        selectedObject = null;
        controls.update();
    }
});

let playerHealth = 100;
const healthBar = document.getElementById('health-bar');

function updateHealthBar() {
    healthBar.style.width = `${playerHealth}%`;
    if (playerHealth <= 0) {
    }
}
const units = [];

function createUnit(x, y, z, type) {
    const unit = new Unit(scene, x, y, z, type);
    units.push(unit);
    hoverableObjects.push(unit.mesh);
}

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
        { speed: 5, health: 50 },
        { speed: 4, health: 50 },
        { speed: 3, health: 50 },
    ],
    [
        { speed: 5, health: 50 },
        { speed: 4, health: 50 },
        { speed: 3, health: 50 },
    ],
    [
        { speed: 5, health: 50 },
        { speed: 4, health: 50 },
        { speed: 3, health: 50 },
    ],
];

function spawnEnemy(path, delay, speed, health) {
    setTimeout(() => {
        const enemy = new Enemy(scene, path, speed, health);
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
        const enemyData = waveData[i];
        spawnEnemy(path, i * spawnDelay, enemyData.speed, enemyData.health);
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
}

window.addEventListener('keydown', handleKeyPress);

function onEnemyReachedEnd(enemy) {
    playerHealth -= enemy.health;

    if (playerHealth < 0) {
        playerHealth = 0;
    }
    updateHealthBar();

    scene.remove(enemy.enemy);
    delete enemies[enemy.id];
}

let selectedUUID = null;
let selectedObject = null;

function handleObjectClick(position, object) {
    if (!object) {
        console.warn("Clicked object is undefined.");
        return;
    }

    console.log(`Clicked object at: x=${position.x}, y=${position.y}, z=${position.z}`);

    selectedUUID = object.uuid;
    selectedObject = object;
    console.log(`Selected UUID: ${selectedUUID}`);

    controls.target.set(position.x, position.y, position.z);
    controls.update();
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

const hoverableObjects = [boxMesh2, boxMesh];
for (let id in enemies) {
    hoverableObjects.push(enemies[id].enemy);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "u" || event.key === "U") {
        Unit.startPlacementMode(scene, camera, 'attacker', (x, y, z, type) => {
            createUnit(x, y, z, type);
        });
    }
});

function setUnitLevel(unitIndex, newLevel) {
    if (units[unitIndex]) {
        units[unitIndex].setLevel(newLevel);
    }
}

initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick);

function draw() {
    const deltaTime = clock.getDelta();

    for (let id in enemies) {
        let enemy = enemies[id];
        enemy.update(deltaTime, onEnemyReachedEnd);
    }
    updateCamera(selectedObject);
    for (let unit of units) {
        unit.update(enemies, deltaTime);
    }

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
}

export { hoverableObjects };

function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

// Event
window.addEventListener('resize', setSize);

draw();

// commands
document.addEventListener("keydown", function(event) {
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
});

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
        case command.startsWith("setDamage"):
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
        default:
    }
}