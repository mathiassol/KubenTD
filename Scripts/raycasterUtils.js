import * as THREE from 'three';

export function initRaycasting(scene, camera, floorMesh, hoverableObjects, handleObjectClick, units) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastHoveredUnit = null;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hoverableObjects, true);

        const unitIntersect = intersects.find(intersect => {
            return units.some(u => u.mesh === intersect.object);
        });

        if (unitIntersect) {
            const hoveredUnit = units.find(u => u.mesh === unitIntersect.object);
            if (hoveredUnit !== lastHoveredUnit) {
                console.log(`Hovering over unit: ${hoveredUnit.type}`);
                lastHoveredUnit = hoveredUnit;
            }
        } else if (lastHoveredUnit) {
            lastHoveredUnit = null;
        }
    });

    document.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hoverableObjects, true);

        if (intersects.length > 0) {
            handleObjectClick(intersects[0].point, intersects[0].object);
        }
    });
}