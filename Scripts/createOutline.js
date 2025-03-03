import * as THREE from 'three';
function createOutline(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3
    });
    const outline = new THREE.LineSegments(edges, outlineMaterial);
    outline.renderOrder = 1;

    outline.position.set(0, 0, 0);
    outline.rotation.copy(mesh.rotation);
    outline.scale.copy(mesh.scale);

    mesh.add(outline);

    return outline;
}


export { createOutline };
