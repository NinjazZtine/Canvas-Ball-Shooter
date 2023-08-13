
class Enemy {
    constructor(x, y, velX = 0, velY = 0, size = 10, color = "red") {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.targetAngle = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.onFireCooldown = true;
        this.onFireCooldownSmart = true;
        this.markedForDeletion = false;
    }

    aim(target) {
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    fireProjectile() {
        if (!this.onFireCooldown) {
            if (Math.random() < 0.3) {
                const velX = this.targetX * 4;
                const velY = this.targetY * 4;
                const x = this.x + this.targetX * 30;
                const y = this.y + this.targetY * 30;
                projectileArray.push(new Projectile(x, y, velX, velY, "red"));
            }
            this.onFireCooldown = true;
        }
    }
    
    fireSmartProjectile(target) {
        if (smartProjectileArray.length > 6) return
        if (!this.onFireCooldownSmart) {
            if (Math.random() < 0.2) {
                smartProjectileArray.push(new SmartProjectile(this.x, this.y, target, this.color));
            }
            this.onFireCooldownSmart = true;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "white";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.targetX * (this.size * 1.7), this.y + this.targetY * (this.size * 1.7));
        ctx.stroke();
    }
    
    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.aim(player);
        this.fireProjectile();
        this.fireSmartProjectile(player);
        this.draw();
    }
}

function createEnemy() {
    if (Math.random < 0.5) return;
    if (enemyArray.length > 3) return;
    const big = 20;
    const medium = 15;
    const small = 10;
    let size = 15;
    const rng = Math.floor(Math.random() * 3);
    switch (rng) {
        case 0:
            size = small;
            break;
        case 1:
            size = medium;
            break;
        case 2:
            size = big;
            break;
    }
    let x;
    let y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -size : canvas.height + size;
    }
    const angle = Math.atan2(player.y - y, player.x - x);
    const randomVel = Math.random() * 1 + 0.3;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
    const color = "hsl(" + Math.random() * 360 + "0,100%,70%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}
