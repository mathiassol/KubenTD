import * as THREE from 'three';

export default class Unit {
    constructor(scene, x, y, z, damage, range, attackSpeed) {
        this.scene = scene;
        this.damage = damage;
        this.range = range;
        this.attackSpeed = attackSpeed;
        this.lastAttackTime = 0;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            new THREE.MeshLambertMaterial({ color: 'green' })
        );
        this.mesh.position.set(x, y, z);
        this.scene.add(this.mesh);
    }

    findEnemiesInRange(enemies) {
        return Object.values(enemies).filter(enemy =>
            this.mesh.position.distanceTo(enemy.enemy.position) <= this.range
        );
    }

    update(enemies, deltaTime) {
        this.lastAttackTime += deltaTime;
        if (this.lastAttackTime >= this.attackSpeed) {
            let targets = this.findEnemiesInRange(enemies);
            if (targets.length > 0) {

                let target = targets[0];
                target.health -= this.damage;
                if (target.health <= 0) {
                    this.scene.remove(target.enemy);
                    delete enemies[target.id];
                }
                this.lastAttackTime = 0;
            }
        }
    }

    static startPlacementMode(scene, camera, onPlace) {
        let previewMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            new THREE.MeshLambertMaterial({ color: 'green', transparent: true, opacity: 0.5 })
        );
        scene.add(previewMesh);

        function onMouseMove(event) {
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(scene.children.find(obj => obj.isMesh));

            if (intersects.length > 0) {
                previewMesh.position.set(intersects[0].point.x, 0, intersects[0].point.z);
            }
        }

        function onMouseClick() {
            scene.remove(previewMesh);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onMouseClick);
            onPlace(previewMesh.position.x, 0, previewMesh.position.z);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
    }
}
