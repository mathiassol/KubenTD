import * as THREE from 'three';

let enemyCounter = 0;
let lastTime = performance.now();
let isGamePaused = false;

document.addEventListener('visibilitychange', () => {
    isGamePaused = document.hidden;
    lastTime = performance.now();
});
export default class Enemy {
    constructor(scene, path, speed, enemyHealth, type, material) {
        this.scene = scene;
        this.path = path;
        this.speed = speed;
        this.health = enemyHealth;
        this.type = type;
        this.material = material;
        this.currentWaypointIndex = 0;
        this.isMoving = true;


        this.id = `enemy_${enemyCounter++}`;
        this.enemyGeometry = new THREE.SphereGeometry(2, 16, 16);
        this.updateMaterial();
        this.enemy = new THREE.Mesh(this.enemyGeometry, this.enemyMaterial);

        if (this.type === 'air') {
            this.enemy.position.set(0, 10, 0);
        }
        this.scene.add(this.enemy);
        console.log('Enemy created:', this.type,",", this.material);

    }
    updateMaterial() {
        switch (true) {
            case this.material === 'default':
                this.enemyMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
                break;
            case this.material === 'wood':
                this.enemyMaterial = new THREE.MeshLambertMaterial({ color: '#b9835a' });
                break;
            case this.material === 'steal':
                this.enemyMaterial = new THREE.MeshLambertMaterial({ color: '#7f7f7f' });
                break;
            case this.material === 'arcane':
                this.enemyMaterial = new THREE.MeshLambertMaterial({ color: '#57fff7' });
                break;
        }
    }

    update(deltaTime, onEnemyReachedEnd) {
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
            direction.normalize().multiplyScalar(Math.min(moveDistance, distance));
            this.enemy.position.add(direction);
        } else {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.path.length;

            if (this.currentWaypointIndex === 0) {
                this.isMoving = false;
                onEnemyReachedEnd(this);
            }
        }

        this.updateDistanceToEnd();
    }

    updateDistanceToEnd() {
        const remainingPath = this.path.slice(this.currentWaypointIndex);
        this.distanceToEnd = remainingPath.reduce((acc, waypoint, index) => {
            const nextWaypoint = remainingPath[index + 1] || this.enemy.position;
            return acc + waypoint.distanceTo(nextWaypoint);
        }, 0);
    }
}
