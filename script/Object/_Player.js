class Player {
    constructor(x, y, size = 15, color = "white") {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.color = color;
        this.size = size;
        this.targetAngle = 0;
        this.targetX = 1;
        this.targetY = 0;
        this.onFireCooldown = false;
    }

    aim(angle) {
        this.targetAngle = angle;
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    move(velX, velY) {
        this.velX = velX;
        this.velY = velY;
    }

    fireProjectile() {
        if (!this.onFireCooldown) {
            const velX = this.targetX * 5;
            const velY = this.targetY * 5;
            const x = this.x + this.targetX * 20;
            const y = this.y + this.targetY * 20;
            projectileArray.push(new Projectile(x, y, velX, velY));
            this.onFireCooldown = true;
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
        ctx.lineTo(this.x + this.targetX * 25, this.y + this.targetY * 25);
        ctx.stroke();
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;

        if (this.x + this.size > CanvasWidth) {
            this.x = CanvasWidth - this.size;
        } else if (this.x - this.size < 0) {
            this.x = this.size;
        }
        if (this.y + this.size > CanvasHeight) {
            this.y = CanvasHeight - this.size;
        } else if (this.y - this.size < 0) {
            this.y = this.size;
        }
        if (aimControl.isActive) {
            if (aimControl.power > 0.6) {
                this.fireProjectile();
            }
        }
        this.draw();
    }
}
