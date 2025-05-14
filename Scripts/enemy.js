import * as THREE from 'three';
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
        this.enemyGeometry = new THREE.SphereGeometry(2, 16, 16);
        this.enemyMaterial = new THREE.MeshLambertMaterial({
            color: 'red'
        });
        this.enemy = new THREE.Mesh(this.enemyGeometry, this.enemyMaterial);

        if (this.type === 'air') {
            this.enemy.position.set(0, 10, 0);
        }
        this.scene.add(this.enemy);

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
        } else {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.path.length;

            if (this.currentWaypointIndex === 0) {
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