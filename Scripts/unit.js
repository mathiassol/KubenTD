import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AudioLoader } from 'three';
import { AnimationMixer } from 'three';
import { Audio, AudioListener } from 'three';
import { unitConfig } from './unitConfig.js';
import { cash, setCash } from './mainFrame.js';
import { DamageText } from './damageText.js';


export default class Unit {
    constructor(scene, x, y, z, type, hoverableObjects) {
        this.initialize(scene, x, y, z, type, hoverableObjects);
    }

    initialize(scene, x, y, z, type, hoverableObjects) {
        if (!unitConfig[type]) {
            console.error(`Invalid unit type: ${type}`);
            return;
        }

        this.scene = scene;
        this.type = type;
        this.pathLevels = { path1: 0, path2: 0, path3: 0 };
        this.chosenPaths = new Set();
        this.baseStats = unitConfig[type].baseStats;
        this.target = unitConfig[type].target;
        this.invisible = unitConfig[type].invisible || false;
        this.magic = unitConfig[type].magic || false;
        this.projectile = unitConfig[type].projectile || false;
        this.penetration = unitConfig[type].penetration || false;
        this.setStats();
        this.lastAttackTime = 0;
        this.damageTexts = [];
        this.hoverableObjects = hoverableObjects || [];
        this.initializeSound();
        this.mixer = null;
        this.action = null;

        this.loader = new GLTFLoader();
        this.loadModel(x, y, z);
    }

    initializeSound() {
        const camera = this.scene.camera || this.scene.getObjectByProperty('type', 'PerspectiveCamera');

        if (!this.scene.audioListener) {
            this.scene.audioListener = new AudioListener();
            if (camera) {
                camera.add(this.scene.audioListener);
            } else {
                console.warn('Camera not found for audio listener');
                return;
            }
        }
        this.shootSound = new Audio(this.scene.audioListener);

        const audioLoader = new AudioLoader();
        const soundPath = `SFX/${this.type}_attack.ogg`;

        audioLoader.load(soundPath, (buffer) => {
            this.shootSound.setBuffer(buffer);
            this.shootSound.setVolume(1.2);
        });
    }

    playShootSound() {
        if (this.shootSound && !this.shootSound.isPlaying) {
            this.shootSound.play();
        }
    }

    loadModel(x, y, z) {
        const modelPath = this.getModelPath();
        this.loader.load(modelPath, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.position.set(x, y, z);

            const scale = 3;
            this.mesh.scale.set(scale, scale, scale);
            this.mesh.rotation.y = Math.PI / 2;

            const UNIT_ANIMATIONS = {
                gunnar: 1,
                mage: 2,
                archer: 0
            };

            if (gltf.animations.length > 0) {
                this.mixer = new AnimationMixer(this.mesh);
                const animationIndex = UNIT_ANIMATIONS[this.type] ?? 0;
                this.action = this.mixer.clipAction(gltf.animations[animationIndex]);
                this.action.setLoop(THREE.LoopOnce);
                this.action.clampWhenFinished = true;
                this.action.play();
                this.mixer.update(this.action.getClip().duration);
                this.action.paused = true;
            }
            this.scene.add(this.mesh);

            const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
            const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
            const selectionBox = new THREE.Mesh(boxGeometry, boxMaterial);
            selectionBox.position.set(x, y, z);
            selectionBox.userData.isSelectionBox = true;
            selectionBox.userData.unit = this;
            selectionBox.renderOrder = 1;
            this.scene.add(selectionBox);

            if (this.mesh) {
                this.hoverableObjects.push(this.mesh);
                this.hoverableObjects.push(selectionBox);
            }
        });
    }

    getModelPath() {
        const basePath = `assets/`;
        let modelName = `${this.type}.glb`;

        return basePath + modelName;
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
                this.updateModel();
                console.log(`Upgraded ${path} to level ${this.pathLevels[path]}.`);
            }
        }
    }

    updateModel() {
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => {
                            if (material.map) material.map.dispose();
                            material.dispose();
                        });
                    } else {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(this.mesh);
        }
        this.loadModel(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    }

    findEnemiesInRange(enemies) {
        return Object.values(enemies).filter(enemy =>
            this.mesh.position.distanceTo(enemy.enemy.position) <= this.range
        );
    }

    playShootAnimation() {
        if (this.action) {
            this.action.reset();
            this.action.play();
        }
    }

    update(enemies, deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        this.lastAttackTime += deltaTime;

        let targets = this.findEnemiesInRange(enemies);

        if (targets.length > 0) {
            targets.sort((a, b) => a.distanceToEnd - b.distanceToEnd);
            this.invisible = unitConfig[this.type].invisible;

            if (this.type === 'hybrid') {
                console.log(1)
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
                const angle = Math.atan2(direction.x, direction.z) - -Math.PI / 2;
                this.mesh.rotation.y = angle;

                if (this.lastAttackTime >= this.attackSpeed) {
                    console.log("Attack triggered");

                    this.playShootSound();
                    this.playShootAnimation();

                    let damageDealt = this.damage;
                    if (this.magic === false && this.currentTarget.magic === true) {
                        damageDealt *= 0.7;
                    }
                    this.currentTarget.takeDamage(damageDealt);

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


        this.damageTexts = this.damageTexts.filter(damageText => {
            const isActive = damageText.update();
            if (!isActive) {
                if (damageText.mesh) {
                    if (damageText.mesh.geometry) damageText.mesh.geometry.dispose();
                    if (damageText.mesh.material) damageText.mesh.material.dispose();
                    this.scene.remove(damageText.mesh);
                }
            }
            return isActive;
        });
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
            const intersectableObjects = scene.children.filter(obj => obj.isMesh);

            if (intersectableObjects.length > 0) {
                const intersects = raycaster.intersectObjects(intersectableObjects);

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