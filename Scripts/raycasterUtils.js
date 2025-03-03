import * as THREE from 'three';
function initRaycasting(scene, camera, outline, floorMesh) {
    let intersects = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', onMouseMove, false);

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        scene.updateMatrixWorld();
        raycaster.setFromCamera(mouse, camera);
        intersects = getIntersects(raycaster);

        outline.visible = false;

        if (intersects.length > 0) {
            outline.visible = true;
        } else {
            outline.visible = false;
        }
    }

    function getIntersects(raycaster) {
        const objects = [];
        scene.traverse(function (object) {
            if (object instanceof THREE.Mesh && object !== floorMesh) {
                objects.push(object);
            }
        });

        return raycaster.intersectObjects(objects);
    }
}
export { initRaycasting };
