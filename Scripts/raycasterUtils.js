import * as THREE from 'three';

function createOutline(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3
    });

    const outline = new THREE.LineSegments(edges, outlineMaterial);
    outline.renderOrder = 1;
    outline.scale.multiplyScalar(1.05);

    return outline;
}

function initRaycasting(scene, camera, floorMesh, hoverableObjects, onObjectClick) {
    let hoveredObject = null;
    let outlineMesh = null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseClick, false);

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        scene.updateMatrixWorld(true);
        raycaster.setFromCamera(mouse, camera);
        const intersects = getIntersects(raycaster);

        if (intersects.length > 0) {
            const newHoveredObject = intersects[0].object;

            if (hoverableObjects.includes(newHoveredObject) && hoveredObject !== newHoveredObject) {
                removeOutline();
                hoveredObject = newHoveredObject;
                addOutline(hoveredObject);
            }
        } else {
            removeOutline();
            if (hoveredObject && hoveredObject.userData && hoveredObject.userData.enemy) {
                hoveredObject.userData.enemy.hideHealthBar();
            }
            hoveredObject = null;
        }
        if (hoveredObject && !scene.getObjectById(hoveredObject.id)) {
            removeOutline();
            hoveredObject = null;
        }
    }

    function onMouseClick(event) {
        if (event.button === 0 && hoveredObject) {
            console.log('Clicked object:', hoveredObject.name || hoveredObject);
            if (onObjectClick) {
                onObjectClick(hoveredObject.position, hoveredObject);
            }
        }
    }

    function getIntersects(raycaster) {
        return raycaster.intersectObjects(hoverableObjects);
    }

    function addOutline(target) {
        if (!target) return;
        outlineMesh = createOutline(target);
        scene.add(outlineMesh);

        updateOutline();
    }

    function updateOutline() {
        if (outlineMesh && hoveredObject) {
            if (!scene.getObjectById(hoveredObject.id)) {
                removeOutline();
                hoveredObject = null;
                return;
            }

            hoveredObject.updateMatrixWorld(true);
            outlineMesh.matrix.copy(hoveredObject.matrixWorld);
            outlineMesh.matrix.decompose(outlineMesh.position, outlineMesh.quaternion, outlineMesh.scale);

            requestAnimationFrame(updateOutline);
        }
    }

    function removeOutline() {
        if (outlineMesh) {
            scene.remove(outlineMesh);
            outlineMesh.geometry.dispose();
            outlineMesh.material.dispose();
            outlineMesh = null;
        }
    }
}

export { initRaycasting };