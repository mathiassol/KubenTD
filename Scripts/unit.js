import * as THREE from 'three';
import { unitConfig } from './unitConfig.js';
import { cash, setCash } from './Main.js';
import { DamageText } from './damageText.js';

export default class Unit {
    constructor(scene, x, y, z, type) {
        this.scene = scene;
        this.type = type;
        this.pathLevels = { path1: 0, path2: 0, path3: 0 };
        this.chosenPaths = new Set();
        this.baseStats = { ...unitConfig[this.type].baseStats };
        this.target = unitConfig[this.type].target;
        this.invisible = unitConfig[type].invisible || false;
        this.magic = unitConfig[type].magic || false;
        this.projectile = unitConfig[type].projectile || false;
        this.penetration = unitConfig[type].penetration || false;
        this.setStats();
        this.lastAttackTime = 0;
        this.damageTexts = []; // Store DamageText instances

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

        console.log(`Stats set: Damage: ${this.damage}, Range: ${this.range}, Attack Speed: ${this.attackSpeed}, type: ${this.target}, invisible: ${this.invisible}, magic: ${this.magic}, projectile: ${this.projectile}, penetration: ${this.penetration}`);
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
            }
        } else {
        }
    }

    findEnemiesInRange(enemies) {
        return Object.values(enemies).filter(enemy =>
            this.mesh.position.distanceTo(enemy.enemy.position) <= this.range
        );
    }

    update(enemies, deltaTime) {
        this.lastAttackTime += deltaTime;

        let targets = this.findEnemiesInRange(enemies);
        if (targets.length > 0) {
            targets.sort((a, b) => a.distanceToEnd - b.distanceToEnd);
            this.invisible = unitConfig[this.type].invisible;

            if (this.type !== 'hybrid') {
                targets = targets.filter(target => this.target === target.type);
            }
            if (this.invisible === false){
                targets = targets.filter(target => target.invisible === false);
            }
            if (this.penetration === false){
                targets = targets.filter(target => target.steal === false);
            }

            let newTarget = targets[0];

            if (newTarget && newTarget.health > 0) {
                if (!this.currentTarget || newTarget.distanceToEnd < this.currentTarget.distanceToEnd) {
                    this.currentTarget = newTarget;
                }

                const direction = new THREE.Vector3().subVectors(this.currentTarget.enemy.position, this.mesh.position).normalize();
                const angle = Math.atan2(direction.x, direction.z);
                this.mesh.rotation.y = angle;

                if (this.lastAttackTime >= this.attackSpeed) {
                    console.log("Attack triggered");
                    let damageDealt = this.damage;
                    if (this.magic === false && this.currentTarget.magic === true) {
                        damageDealt *= 0.7;
                    }
                    this.currentTarget.health -= damageDealt;

                    const damageText = new DamageText(this.scene, damageDealt.toString(), this.currentTarget.enemy);
                    this.damageTexts.push(damageText);

                    if (this.currentTarget.health <= 0) {
                        this.scene.remove(this.currentTarget.enemy);
                        delete enemies[this.currentTarget.id];
                        this.currentTarget = null;
                    }
                    this.lastAttackTime = 0;
                }
            }
        }

        this.damageTexts = this.damageTexts.filter(damageText => damageText.update());
    }

    static startPlacementMode(scene, camera, type, onPlace) {
        console.log("startPlacementMode triggered");
        let previewMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 10, 5),
            new THREE.MeshLambertMaterial({ color: 'green', transparent: true, opacity: 0.5 })
        );

        const circleGeometry = new THREE.CircleGeometry(7.5, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({ color: 'blue', transparent: true, opacity: 0.5 });
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.rotation.x = -Math.PI / 2;
        circleMesh.position.y = -4.8;
        previewMesh.add(circleMesh);

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
                const position = intersects[0].point;
                previewMesh.position.set(position.x, 0, position.z);
                if (Unit.Colliding(position, scene, previewMesh)) {
                    circleMesh.material.color.set('red');
                } else {
                    circleMesh.material.color.set('blue');
                }
            }
        }

        function onMouseClick() {
            if (circleMesh.material.color.getHexString() !== 'ff0000') {
                scene.remove(previewMesh);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('click', onMouseClick);
                onPlace(previewMesh.position.x, 0, previewMesh.position.z, type);
            }
        }

        window.addEventListener('mousemove', onMouseMove);

        setTimeout(() => {
            window.addEventListener('click', onMouseClick);
        }, 200);
    }

    static Colliding(position, scene, previewMesh) {
        const collisionRadius = 10;
        const units = scene.children.filter(obj => obj.isMesh && obj !== previewMesh);
        for (const unit of units) {
            if (unit.position.distanceTo(position) < collisionRadius) {
                return true;
            }
        }
        return false;
    }
}
export { Unit };