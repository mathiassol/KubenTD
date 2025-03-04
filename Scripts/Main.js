import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { createOutline } from './createOutline.js';
import { initRaycasting } from './raycasterUtils.js';
import { buildWorld } from "./worldElements.js";
import Enemy from './enemy.js';
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
    if (event.key === 'k' || event.key === 'K') {
        controls.target.set(15, 3, 15)
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

// Draw
const clock = new THREE.Clock();

const path = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(20, 0, 20),
    new THREE.Vector3(40, 0, 0),
    new THREE.Vector3(60, 0, -20),
    new THREE.Vector3(80, 0, 0)
];
const enemies = {};

const enemy1 = new Enemy(scene, path, 10, 100);
enemies[enemy1.id] = enemy1;

const enemy2 = new Enemy(scene, path, 20, 40);
enemies[enemy2.id] = enemy2;
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

    // Store the position of the object when clicked
    controls.target.set(position.x, position.y, position.z);
    controls.update();
}

function updateCamera(scene) {
    if (selectedUUID) {
        const object = scene.getObjectByProperty('uuid', selectedUUID);

        if (object) {
            console.log(`Updating camera for object with UUID: ${selectedUUID}`);

            // Keep the target position at the object, but allow orbiting around it
            const targetPosition = object.position.clone();
            targetPosition.y += 5;

            // Smoothly interpolate towards the target, but avoid locking in place
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

initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick);

function draw() {
    const deltaTime = clock.getDelta();

    for (let id in enemies) {
        let enemy = enemies[id];
        enemy.update(deltaTime, onEnemyReachedEnd);
    }
    updateCamera(selectedObject);

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
}

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
            alert("Available commands: help, hello");
            break;
        case command === "hello":
            alert("Hello there!");
            break;
        case command === "reload":
            window.location.reload(true);
            break;
        case command.startsWith("create"):
            command = command.slice(7);
            switch (true) {
                case command.startsWith("axis"):
                    command = command.slice(5);
                    const axesHelper = new THREE.AxesHelper(command);
                    scene.add(axesHelper);
                    break
            }
            break

        default:
            console.log("error: 1, unknown command");
    }
}
