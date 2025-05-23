import * as THREE from 'three';

const FIREBALL_COLORS = [0xff4500, 0xffa500, 0xffff00, 0xff6a00, 0xff0000];

export class FireballExplosion {
    constructor(scene, position, count = 40) {
        this.scene = scene;
        this.cubes = [];
        this.velocities = [];
        this.lifetimes = [];
        this.maxLifetime = 3; // seconds

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 0.7 + 0.3;
            const geometry = new THREE.BoxGeometry(size, size, size);
            const color = FIREBALL_COLORS[Math.floor(Math.random() * FIREBALL_COLORS.length)];
            const material = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.7,
                transparent: true,
                opacity: 1
            });
            const cube = new THREE.Mesh(geometry, material);
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5
            );
            cube.position.copy(position).add(offset);
            this.scene.add(cube);
            this.cubes.push(cube);

            // Lower velocity for visible movement
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );
            this.velocities.push(velocity);
            this.lifetimes.push(0);
        }
        this.alive = true;
    }

    update(deltaTime) {
        let allDead = true;
        for (let i = 0; i < this.cubes.length; i++) {
            this.lifetimes[i] += deltaTime;
            if (this.lifetimes[i] < this.maxLifetime) {
                this.cubes[i].position.addScaledVector(this.velocities[i], deltaTime);
                this.velocities[i].y -= 9.8 * deltaTime;
                this.velocities[i].multiplyScalar(0.98);
                this.cubes[i].material.opacity = 1 - (this.lifetimes[i] / this.maxLifetime);
                allDead = false;
            } else {
                if (this.cubes[i].parent) {
                    this.scene.remove(this.cubes[i]);
                    this.cubes[i].geometry.dispose();
                    this.cubes[i].material.dispose();
                }
            }
        }
        return !allDead;
    }
}