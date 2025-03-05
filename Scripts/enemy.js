import * as THREE from 'three';

let enemyCounter = 0;
let lastTime = performance.now();
let isGamePaused = false;

document.addEventListener('visibilitychange', () => {
    isGamePaused = document.hidden;
    lastTime = performance.now();
});
export default class Enemy {
    constructor(scene, path, speed, enemyHealth) {
        this.scene = scene;
        this.path = path;
        this.speed = speed;
        this.health = enemyHealth;
        this.currentWaypointIndex = 0;
        this.isMoving = true;

        this.id = `enemy_${enemyCounter++}`;
        this.enemyGeometry = new THREE.SphereGeometry(2, 16, 16);
        this.enemyMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
        this.enemy = new THREE.Mesh(this.enemyGeometry, this.enemyMaterial);

        this.scene.add(this.enemy);
    }
    update(deltaTime, onEnemyReachedEnd) {
        if (!this.isMoving || isGamePaused) return;

        const target = this.path[this.currentWaypointIndex];
        const direction = new THREE.Vector3().subVectors(target, this.enemy.position);
        const distance = direction.length();

        if (distance > 0.5) {
            const moveDistance = this.speed * deltaTime;
            direction.normalize().multiplyScalar(Math.min(moveDistance, distance));
            this.enemy.position.add(direction);
        } else {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.path.length;

            if (this.currentWaypointIndex === 0) {
                this.isMoving = false;
                onEnemyReachedEnd(this);
            }
        }
    }
}
