
class SmartProjectile {
    constructor(x, y, target, color = "red",
    initialTargetX = Math.random() * CanvasWidth,
    initialTargetY = Math.random() * CanvasHeight)
    {
        this.x = x;
        this.y = y;
        this.target = target;
        this.targetX = initialTargetX;
        this.targetY = initialTargetY;
        this.finalTargetX = this.target.x;
        this.finalTargetY = this.target.y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.color = color;
        this.size = 5;
        this.lifeTime = 15; //seconds
        this.markedForDeletion = false;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.finalTargetX = this.target.x;
        this.finalTargetY = this.target.y;
        const dx = Math.abs(this.finalTargetX - this.targetX) + 100;
        const dy = Math.abs(this.finalTargetY - this.targetY) + 100;
        const speed = 0.01;
        if (this.targetX > this.finalTargetX) {
            this.targetX -= dx * speed;
        }
        if (this.targetX < this.finalTargetX) {
            this.targetX += dx * speed;
        }
        if (this.targetY > this.finalTargetY) {
            this.targetY -= dy * speed;
        }
        if (this.targetY < this.finalTargetY) {
            this.targetY += dy * speed;
        }
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.velocityX = Math.cos(angle) * 1.5;
        this.velocityY = Math.sin(angle) * 1.5;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.draw();
    }
}


class Projectile {
    constructor(originX, originY, velX, velY, color = "white") {
        this.x = originX;
        this.y = originY;
        this.velX = velX;
        this.velY = velY;
        this.size = 3;
        this.color = color;
        this.markedForDeletion = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.draw();
    }
}
