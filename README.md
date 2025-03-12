# Kuben TD

# Game Description
* list of different types of towers
* each tower has traits
  * targeting (ground, air, hybrid)
  * invisible
  * magic 
  * projectile
  * penetration
* enemies have traits
  * health
  * speed
  * type (ground, air)
  * invisible
  * magic
  * steal

to damage invisible enemies, you need a tower with the invisible trait, sane goes for steal where the tower needs penetration trait. <br>
magic enemies reduce damage from non-magic towers, and magic towers deal normal damage to magic enemies.

# Game Mechanics

DamageText.js <br>
creates a canvas text element in the constructor using THREE.Sprite. <br>
```javascript
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
```
pops the last damage if within 300ms of the last damage, combines the two and creates a new damage element. <br>
```javascript
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
```
updates the position of the damage while slowly fading out. <br>
```javascript
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
```
--- 
# Game Controls

