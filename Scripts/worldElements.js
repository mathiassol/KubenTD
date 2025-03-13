import * as THREE from 'three';
export const buildWorld = (scene) => {
    const directionalLight = new THREE.DirectionalLight('white', 2);
    directionalLight.position.set(1, 1, 2).normalize();
    scene.add(directionalLight);


};
