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

function handleObjectClick(position) {
    console.log(`Clicked object position: x=${position.x}, y=${position.y}, z=${position.z}`);

    controls.target.set(position.x, position.y, position.z);
    controls.update();
}
const hoverableObjects = [boxMesh2, boxMesh];
initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick);


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
        alert("Game Over! The enemy reached the end!");
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
const enemySpeed = 10;
const enemyHealth = 10;
const enemy = new Enemy(scene, path, enemySpeed, enemyHealth);

function draw() {
    const deltaTime = clock.getDelta();
    enemy.update(deltaTime);

    if (enemy.currentWaypointIndex === 0 && enemy.enemy.position.distanceTo(path[path.length - 1]) < 0.1) {
        playerHealth -= enemy.enemyHealth;
        updateHealthBar();
    }
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