import * as THREE from 'three';

class DamageText {
    static recentDamageTexts = [];
    static activeDamageTexts = [];

    constructor(scene, text, enemy) {
        this.enemy = enemy;
        const damage = parseInt(text, 10);
        const color = this.getDamageColor(damage);

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        context.font = 'Bold 200px Arial';
        context.fillStyle = color;
        context.fillText(text, 0, 200);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.mesh = new THREE.Sprite(material);
        this.mesh.scale.set(10, 5, 1);
        this.mesh.position.copy(this.enemy.position);
        scene.add(this.mesh);

        this.startTime = performance.now();

        this.combineRecentDamageTexts(scene, damage, enemy);

        DamageText.activeDamageTexts.push(this);
    }

    getDamageColor(damage) {
        const minDamage = 5;
        const maxDamage = 100;
        const clampedDamage = Math.max(minDamage, Math.min(damage, maxDamage));
        const ratio = (clampedDamage - minDamage) / (maxDamage - minDamage);
        const red = Math.floor(255 * (1 - ratio));
        const green = Math.floor(255 * ratio);
        return `rgb(${red},${green},0)`;
    }

    combineRecentDamageTexts(scene, damage, enemy) {
        const currentTime = performance.now();
        DamageText.recentDamageTexts = DamageText.recentDamageTexts.filter(d => currentTime - d.time < 300);

        if (DamageText.recentDamageTexts.length > 0) {
            const recentDamage = DamageText.recentDamageTexts.pop();
            const combinedDamage = recentDamage.damage + damage;
            const combinedDamageText = new DamageText(scene, combinedDamage.toString(), enemy);
            scene.add(combinedDamageText.mesh);

            DamageText.activeDamageTexts = DamageText.activeDamageTexts.filter(d => d !== this && d !== recentDamage.instance);

            this.mesh.parent.remove(this.mesh);
            recentDamage.instance.mesh.parent.remove(recentDamage.instance.mesh);
        } else {
            DamageText.recentDamageTexts.push({ damage, time: currentTime, instance: this });
        }
    }

    update() {
        const elapsedTime = (performance.now() - this.startTime) / 1000;
        this.mesh.position.copy(this.enemy.position);
        this.mesh.position.y += elapsedTime * 3;
        this.mesh.material.opacity = 1 - elapsedTime;
        if (elapsedTime > 1) {
            if (this.mesh.parent) {
                this.mesh.parent.remove(this.mesh);
            }
            return false;
        }
        return true;
    }

    static updateAll() {
        DamageText.activeDamageTexts = DamageText.activeDamageTexts.filter(damageText => damageText.update());
    }
}

export { DamageText };