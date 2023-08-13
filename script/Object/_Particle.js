
class Particle {
    constructor(x, y, color, speed, xVelOffset, yVelOffset) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 3;
        this.xVel = (Math.random() * 8 - 4) * speed * 0.03 + xVelOffset;
        this.yVel = (Math.random() * 8 - 4) * speed * 0.03 + yVelOffset;
        this.color = color;
        this.markedForDeletion = false;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
    
    update() {
        this.x += this.xVel;
        this.y += this.yVel;
        this.xVel *= 0.98;
        this.yVel *= 0.98;
        if (this.size > 0.2) this.size -= 0.05;
        this.draw();
    }
}


function emitParticle(x, y, multiplier, color = "white", xVelOffset = 0, yVelOffset = 0) {
    for (i = 0; i < multiplier / 2; i++) {
        particleArray.push(
            new Particle(x, y, color, multiplier, xVelOffset, yVelOffset)
        );
    }
}
