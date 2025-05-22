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
            this.mesh.userData.isUnit = true;

            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

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

            if (this.mesh) {
                this.hoverableObjects.push(this.mesh);
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

        const previewContainer = new THREE.Group();
        scene.add(previewContainer);

        const circleGeometry = new THREE.CircleGeometry(7.5, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 'blue',
            transparent: true,
            opacity: 0.5
        });
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.rotation.x = -Math.PI / 2;
        circleMesh.position.y = -4.8;
        previewContainer.add(circleMesh);

        // Add range preview
        const rangeRadius = unitConfig[type].baseStats.range; // Get range from unitConfig
        const rangeGeometry = new THREE.CircleGeometry(rangeRadius, 64);
        const rangeMaterial = new THREE.MeshBasicMaterial({
            color: 'green',
            transparent: true,
            opacity: 0.3
        });
        const rangeMesh = new THREE.Mesh(rangeGeometry, rangeMaterial);
        rangeMesh.rotation.x = -Math.PI / 2;
        rangeMesh.position.y = -4.7; // Slightly above the ground
        previewContainer.add(rangeMesh);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.font = 'bold 32px Arial';
        context.fillStyle = 'rgba(255,255,255,0.8)';
        context.textAlign = 'center';
        context.fillText('Q Cancel', canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: false
        });
        const textSprite = new THREE.Sprite(spriteMaterial);
        textSprite.scale.set(10, 2.5, 1);
        textSprite.position.y = 10;

        previewContainer.add(textSprite);

        const loader = new GLTFLoader();
        const modelPath = `assets/${type}.glb`;

        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            const scale = 3;
            model.scale.set(scale, scale, scale);
            model.rotation.y = Math.PI / 2;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            previewContainer.add(model);
        });

        function cleanupPlacement() {
            scene.remove(previewContainer);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onMouseClick);
            window.removeEventListener('keydown', onKeyDown);
        }

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
                    previewContainer.position.set(position.x, 0, position.z);
                    if (Unit.Colliding(position, scene, previewContainer)) {
                        circleMesh.material.color.set('red');
                    } else {
                        circleMesh.material.color.set('blue');
                    }
                }
            }
        }

        function onMouseClick(event) {
            if (circleMesh.material.color.getHexString() !== 'ff0000') {
                const position = { x: previewContainer.position.x, y: 0, z: previewContainer.position.z };
                onPlace(position.x, position.y, position.z, type);

                if (!event.shiftKey) {
                    cleanupPlacement();
                }
            }
        }

        function onKeyDown(event) {
            if (event.key === 'q' || event.key === 'Q') {
                cleanupPlacement();
            }
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('keydown', onKeyDown);

        setTimeout(() => {
            window.addEventListener('click', onMouseClick);
        }, 200);
    }

    static Colliding(position, scene, previewMesh) {
        const collisionRadius = 7;
        const units = scene.children.filter(obj => {
            return (obj.isMesh && obj.userData.isUnit) ||
                (obj.type === "Group" && obj.children.some(child => child.userData.isUnit)) ||
                (obj.type === "Group" && obj.userData.isUnit);
        });

        const positionVec = new THREE.Vector3(position.x, 0, position.z);

        for (const unit of units) {
            if (unit === previewMesh) continue;

            let unitPosition;
            if (unit.type === "Group") {
                unitPosition = new THREE.Vector3(unit.position.x, 0, unit.position.z);
            } else {
                unitPosition = new THREE.Vector3(unit.position.x, 0, unit.position.z);
            }

            const distance = unitPosition.distanceTo(positionVec);
            if (distance < collisionRadius * 2) {
                return true;
            }
        }
        return false;
    }
}
export { Unit };