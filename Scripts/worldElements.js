import * as THREE from 'three';
export const buildWorld = (scene) => {
// Light
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('white', 0.5);
    directionalLight.position.x = 1;
    directionalLight.position.z = 2;
    scene.add(directionalLight);
};
