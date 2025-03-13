import * as THREE from 'three';

function createSelectionBox(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    });

    const selectionBox = new THREE.Mesh(geometry, material);
    selectionBox.renderOrder = 1;

    return selectionBox;
}

function initRaycasting(scene, camera, floorMesh, hoverableObjects, onObjectClick) {
    let hoveredObject = null;
    let selectionBox = null;

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
                removeSelectionBox();
                hoveredObject = newHoveredObject;
                addSelectionBox(hoveredObject);
            }
        } else {
            removeSelectionBox();
            hoveredObject = null;
        }
        if (hoveredObject && !scene.getObjectById(hoveredObject.id)) {
            removeSelectionBox();
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
        return raycaster.intersectObjects(hoverableObjects.filter(obj => obj && obj.isObject3D));
    }

    function addSelectionBox(target) {
        if (!target) return;
        selectionBox = createSelectionBox(target);
        scene.add(selectionBox);

        updateSelectionBox();
    }

    function updateSelectionBox() {
        if (selectionBox && hoveredObject) {
            if (!scene.getObjectById(hoveredObject.id)) {
                removeSelectionBox();
                hoveredObject = null;
                return;
            }

            hoveredObject.updateMatrixWorld(true);
            selectionBox.position.copy(hoveredObject.position);
            selectionBox.quaternion.copy(hoveredObject.quaternion);
            selectionBox.scale.copy(hoveredObject.scale);

            requestAnimationFrame(updateSelectionBox);
        }
    }

    function removeSelectionBox() {
        if (selectionBox) {
            scene.remove(selectionBox);
            selectionBox.geometry.dispose();
            selectionBox.material.dispose();
            selectionBox = null;
        }
    }
}

export { initRaycasting };