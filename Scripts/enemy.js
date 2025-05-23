import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

import {
    cash,
    setCash
} from './mainFrame.js';


let enemyCounter = 0;
let lastTime = performance.now();
let isGamePaused = false;

document.addEventListener('visibilitychange', () => {
    isGamePaused = document.hidden;
    lastTime = performance.now();
});

export default class Enemy {
    constructor(scene, path, speed, enemyHealth, type, invisible = false, magic = false, steal = false, cash = 50) {
        this.scene = scene;
        this.path = path;
        this.speed = speed;
        this.health = enemyHealth;
        this.maxHealth = enemyHealth;
        this.type = type;
        this.invisible = invisible;
        this.magic = magic;
        this.steal = steal;
        this.cash = cash;
        this.currentWaypointIndex = 0;
        this.isMoving = true;
        this.id = `enemy_${enemyCounter++}`;
        this.modelLoaded = false;


        const tempGeometry = new THREE.SphereGeometry(2, 16, 16);
        const tempMaterial = new THREE.MeshLambertMaterial({ visible: false });
        this.enemy = new THREE.Mesh(tempGeometry, tempMaterial);

        if (this.path && this.path.length > 0) {
            const startPosition = this.path[0].clone();
            if (this.type === 'air') {
                startPosition.y += 10;
            }
            this.enemy.position.copy(startPosition);
        } else {
            console.warn('Path is empty or undefined. Enemy position set to (0, 0, 0).');
        }
        this.scene.add(this.enemy);

        const loader = new GLTFLoader();
        loader.load('./assets/enemy.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(3.5, 3.5, 3.5);
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = this.invisible;
                    child.material.opacity = this.invisible ? 0.5 : 1;
                }
            });
            this.enemy.add(this.model);

            this.mixer = new THREE.AnimationMixer(this.model);
            const walkAnimation = gltf.animations[0];
            if (walkAnimation) {
                this.walkAction = this.mixer.clipAction(walkAnimation);
                this.walkAction.play();
                this.walkAction.loop = THREE.LoopRepeat;
            }
            this.modelLoaded = true;
        });

        const healthBarGeometry = new THREE.PlaneGeometry(5, 0.5);
        const healthBarMaterial = new THREE.MeshBasicMaterial({
            color: '#00db08',
            side: THREE.DoubleSide
        });
        this.healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        this.healthBar.position.set(0, 3, 0);
        this.healthBar.visible = false;
        this.enemy.add(this.healthBar);

        console.log("Enemy health:", this.health, "type:", this.type, ", invisible:", this.invisible, ", magic:", this.magic, "steal:", this.steal);
    }

    update(deltaTime, onEnemyReachedEnd, camera) {
        if (!this.isMoving || isGamePaused) return;

        if (this.mixer && this.modelLoaded) {
            this.mixer.update(deltaTime);
        }

        if (!this.path || this.currentWaypointIndex >= this.path.length) return;

        let target = this.path[this.currentWaypointIndex];
        if (this.type === 'air') {
            target = target.clone();
            target.y += 10;
        }

        const direction = new THREE.Vector3().subVectors(target, this.enemy.position);
        const distance = direction.length();

        if (distance > 0.5) {
            const moveDistance = this.speed * deltaTime;
            const t = Math.min(moveDistance / distance, 1);
            this.enemy.position.lerp(target, t);

            if (direction.length() > 0.001) {
                this.enemy.lookAt(target);
            }
        } else {
            this.currentWaypointIndex++;
            if (this.currentWaypointIndex >= this.path.length) {
                this.isMoving = false;
                onEnemyReachedEnd(this);
            }
        }

        this.updateDistanceToEnd();
        this.updateHealthBarRotation(camera);
    }

    updateDistanceToEnd() {
        const remainingPath = this.path.slice(this.currentWaypointIndex);
        this.distanceToEnd = remainingPath.reduce((acc, waypoint, index) => {
            const nextWaypoint = remainingPath[index + 1] || this.enemy.position;
            return acc + waypoint.distanceTo(nextWaypoint);
        }, 0);
    }

    updateHealthBarRotation(camera) {
        this.healthBar.lookAt(camera.position);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.updateHealthBar();

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        setCash(cash + this.cash);

        this.scene.remove(this.enemy);
        if (this.enemy.geometry) this.enemy.geometry.dispose();
        if (this.enemy.material) this.enemy.material.dispose();

        this.isMoving = false;
    }

    updateHealthBar() {
        const healthPercentage = this.health / this.maxHealth;
        this.healthBar.scale.set(healthPercentage, 1, 1);
    }
}