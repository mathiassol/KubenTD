import * as THREE from 'three';

let move = true;

export default class Enemy {
    constructor(scene, path, speed) {
        this.scene = scene;
        this.path = path;
        this.speed = speed;
        this.currentWaypointIndex = 0;

        this.enemyGeometry = new THREE.SphereGeometry(2, 16, 16);
        this.enemyMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
        this.enemy = new THREE.Mesh(this.enemyGeometry, this.enemyMaterial);

        this.scene.add(this.enemy);
    }
    update(deltaTime) {
        const target = this.path[this.currentWaypointIndex];
        const direction = new THREE.Vector3().subVectors(target, this.enemy.position);
        const distance = direction.length();

        if (distance > 0.1 && move === true) {
            const moveDistance = this.speed * deltaTime;
            direction.normalize().multiplyScalar(moveDistance);
            this.enemy.position.add(direction);
        } else {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.path.length;
            console.log(this.currentWaypointIndex);
            if (this.currentWaypointIndex === 0){
                console.log("done")
                move = false;

            }
        }
    }
}
