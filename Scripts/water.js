import * as THREE from 'three';
import { WaterMesh } from 'three/addons/objects/WaterMesh.js';

export function createWater(scene) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const loader = new THREE.TextureLoader();
    const waterNormals = loader.load('textures/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    const water = new WaterMesh(
        waterGeometry,
        {
            waterNormals: waterNormals,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7
        }
    );

    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;

    scene.add(water);
}
