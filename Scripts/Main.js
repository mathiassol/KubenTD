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

let selectedObject = null;

function handleObjectClick(position, object) {
    console.log(`Clicked object at: x=${position.x}, y=${position.y}, z=${position.z}`);

    selectedObject = object; // Store the clicked object

    // Set initial camera target
    controls.target.set(position.x, position.y, position.z);
    controls.update();
}
function updateCamera(sObj) {
    if (sObj) {
        const targetPosition = sObj.position.clone();
        console.log(targetPosition);
        targetPosition.y += 5; // Adjust height for better tracking

        // Smoothly interpolate camera position
        camera.position.lerp(targetPosition.clone().add(new THREE.Vector3(0, 10, 20)), 0.1);
        controls.target.lerp(targetPosition, 0.1);
        controls.update();
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
    updateCamera(selectedObject)

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