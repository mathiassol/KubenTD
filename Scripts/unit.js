import * as THREE from 'three';
import { hoverableObjects } from './main.js';
import { unitConfig } from './unitConfig.js';

export default class Unit {
    constructor(scene, x, y, z, type, level = 1) {
        this.scene = scene;
        this.type = type;
        this.level = level;
        this.setStats();
        this.lastAttackTime = 0;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            new THREE.MeshLambertMaterial({ color: 'green' })
        );
        this.mesh.position.set(x, y, z);
        this.scene.add(this.mesh);
    }

    setStats() {
        const stats = unitConfig[this.type][this.level - 1];
        this.damage = stats.damage;
        this.range = stats.range;
        this.attackSpeed = stats.attackSpeed;
        console.log(`Stats set for level ${this.level}: Damage: ${this.damage}, Range: ${this.range}, Attack Speed: ${this.attackSpeed}`);
    }

    findEnemiesInRange(enemies) {
        return Object.values(enemies).filter(enemy =>
            this.mesh.position.distanceTo(enemy.enemy.position) <= this.range
        );
    }

    setLevel(newLevel) {
        if (newLevel >= 1 && newLevel <= 6) {
            this.level = newLevel;
            this.setStats();
            console.log(`Unit level set to ${newLevel}. Damage: ${this.damage}, Range: ${this.range}, Attack Speed: ${this.attackSpeed}`);
        }
    }

    update(enemies, deltaTime) {
        this.lastAttackTime += deltaTime;
        if (this.lastAttackTime >= this.attackSpeed) {
            let targets = this.findEnemiesInRange(enemies);
            if (targets.length > 0) {
                let target = targets[0];
                console.log(`Attacking enemy with health: ${target.health} using damage: ${this.damage} at level: ${this.level}`);
                target.health -= this.damage;
                if (target.health <= 0) {
                    this.scene.remove(target.enemy);
                    delete enemies[target.id];
                    console.log(hoverableObjects);
                }
                this.lastAttackTime = 0;
            }
        }
    }

    static startPlacementMode(scene, camera, type, onPlace) {
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
            onPlace(previewMesh.position.x, 0, previewMesh.position.z, type);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
    }
}

export { Unit };