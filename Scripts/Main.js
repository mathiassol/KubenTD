import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { createOutline } from './createOutline.js';
import { initRaycasting } from './raycasterUtils.js';
import { buildWorld } from "./worldElements.js";
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
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshLambertMaterial({
        color: 'burlywood',
        side: THREE.DoubleSide
    })
);
floorMesh.rotation.x = -Math.PI/2;
scene.add(floorMesh);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({ color: 'blue' });
const boxMesh = new THREE.Mesh(geometry, material);
boxMesh.position.z = 10;
scene.add(boxMesh);

const outline = createOutline(boxMesh);
initRaycasting(scene, camera, outline, floorMesh);

window.addEventListener('keydown', function(event) {
    if (event.key === 'k' || event.key === 'K') {
        controls.target.set(15, 3, 15)
        controls.update();
    }
});

// Draw
const clock = new THREE.Clock();

function draw() {
    const delta = clock.getDelta();
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