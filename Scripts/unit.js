import * as THREE from 'three';
import { unitConfig } from './unitConfig.js';
import { cash, setCash, updateCashDisplay } from './Main.js';

export default class Unit {
    constructor(scene, x, y, z, type) {
        this.scene = scene;
        this.type = type;
        this.pathLevels = { path1: 0, path2: 0, path3: 0 };
        this.chosenPaths = new Set();
        this.baseStats = { ...unitConfig[this.type].baseStats };
        this.target = unitConfig[this.type].target;
        this.setStats();
        this.lastAttackTime = 0;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 10, 5),
            new THREE.MeshLambertMaterial({ color: 'green' })
        );
        this.mesh.position.set(x, y, z);
        this.scene.add(this.mesh);
    }

    setStats() {
        const baseStats = unitConfig[this.type].baseStats;
        this.damage = baseStats.damage;
        this.range = baseStats.range;
        this.attackSpeed = baseStats.attackSpeed;

        for (const path of this.chosenPaths) {
            const upgrades = unitConfig[this.type][path].slice(0, this.pathLevels[path]);
            upgrades.forEach(upgrade => {
                this.damage += upgrade.damage;
                this.range += upgrade.range;
                this.attackSpeed += upgrade.attackSpeed;
            });
        }

        console.log(`Stats set: Damage: ${this.damage}, Range: ${this.range}, Attack Speed: ${this.attackSpeed}, type: ${this.target}`);
    }

    canUpgradePath(path) {
        const maxLevel = unitConfig[this.type][path].length;
        const currentLevel = this.pathLevels[path];

        const otherPathsAboveLevel2 = Object.entries(this.pathLevels)
            .filter(([key]) => key !== path)
            .some(([_, level]) => level > 2);

        if (otherPathsAboveLevel2 && currentLevel >= 2) {
            return false;
        }

        if (currentLevel >= maxLevel) {
            return false;
        }

        if (this.chosenPaths.size < 2) {
            return true;
        }

        return this.chosenPaths.has(path);
    }

    upgradePath(path) {
        if (this.canUpgradePath(path)) {
            const upgradeCost = unitConfig[this.type][path][this.pathLevels[path]].upgradePrice;
            if (cash >= upgradeCost) {
                setCash(cash - upgradeCost);
                this.pathLevels[path]++;
                this.chosenPaths.add(path);
                this.setStats();
                console.log(`Upgraded ${path} to level ${this.pathLevels[path]}.`);
            } else {
                console.log("Not enough cash for upgrade.");
            }
        } else {
            console.log(`Cannot upgrade ${path} further or path limit reached.`);
        }
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
                targets.sort((a, b) => a.distanceToEnd - b.distanceToEnd);

                if (this.type !== 'hybrid') {
                    targets = targets.filter(target => this.target === target.type);
                }

                let target = targets[0];

                if (target && target.health > 0) {
                    console.log(`${target.health} | at level: ${this.pathLevels}`);
                    target.health -= this.damage;
                    if (target.health <= 0) {
                        this.scene.remove(target.enemy);
                        delete enemies[target.id];
                    }
                    this.lastAttackTime = 0; // Reset timer
                }
            }
        }
    }

    static startPlacementMode(scene, camera, type, onPlace) {
        console.log("startPlacementMode triggered");
        let previewMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 10, 5),
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