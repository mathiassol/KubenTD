import * as THREE from 'three';

export class BulletProjectile {
    constructor(scene, start, target, onHit) {
        this.scene = scene;
        this.target = target.clone();
        this.onHit = onHit;
        this.speed = 200;

        this.direction = new THREE.Vector3().subVectors(this.target, start).normalize();

        const offset = this.direction.clone().multiplyScalar(7);
        const bulletStart = start.clone().add(offset);

        const geometry = new THREE.BoxGeometry(0.4, 0.4, 3);
        const material = new THREE.MeshBasicMaterial({ color: 0x736c68 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(bulletStart);
        scene.add(this.mesh);

        this.alive = true;

        this.alignToDirection();
    }

    alignToDirection() {
        const axis = new THREE.Vector3(0, 0, 1);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, this.direction);
        this.mesh.quaternion.copy(quaternion);
    }

    update(deltaTime) {
        if (!this.alive) return false;
        const move = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(move);

        if (this.mesh.position.distanceTo(this.target) < 2) {
            this.onHit();
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.alive = false;
            return false;
        }
        return true;
    }
}