import * as THREE from 'three';

function createOutline(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3
    });

    const outline = new THREE.LineSegments(edges, outlineMaterial);
    outline.renderOrder = 1;
    outline.scale.multiplyScalar(1.02);

    return outline;
}

export { createOutline };
