const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let CanvasWidth = canvas.width;
let CanvasHeight = canvas.height;

const player = new Player(100, 100, 15, "hsl(0,0%,66.8%)");
let moveControl = new GestureControl();
let aimControl = new GestureControl();
let delta = 0;

let particleArray = [];
let projectileArray = [];
let smartProjectileArray = [];
let enemyArray = [];

let lastTimeFrame = 0;
let timeElapsed = 0;

class Timer {
    constructor(interval, cFunction) {
        this.timer = 0;
        this.interval = interval;
        this.cFunction = cFunction;
    }

    update(timeElapsed) {
        if (isNaN(timeElapsed)) return;
        if (this.timer > this.interval) {
            this.cFunction();
            this.timer = 0;
        } else {
            this.timer += timeElapsed;
        }
    }
}

const Timers = [
    //enemySpawnRate
    new Timer(5000, createEnemy),
    //playerFireCooldown
    new Timer(150, () => {
        player.onFireCooldown = false;
    }),

    //enemyFireCooldown
    new Timer(600, () => {
        enemyArray.forEach((enemy) => {
            enemy.onFireCooldown = false;
        });
    }),
    new Timer(2000, () => {
        enemyArray.forEach((enemy) => {
            enemy.onFireCooldownSmart = false;
        });
    }),

    //smartProjectileLifeTime
    new Timer(1000, () => {
        smartProjectileArray.forEach((projectile) => {
            projectile.lifeTime -= 1;
        });
    }),
];

function debug() {
    a.innerText = enemyArray.length;
    b.innerText = particleArray.length;
    c.innerText = projectileArray.length;
    //c.innerText = moveControl.touchStartPositionX;
    //d.innerText = moveControl.touchStartPositionY;
}

function gameLoop(delta) {
    ctx.fillStyle = "hsla(360,100%,0%,0.3)";
    ctx.fillRect(0, 0, CanvasWidth, CanvasHeight);
    player.update();

    projectileArray.forEach((projectile, i) => {
        projectile.update();
        //enemyPassedBorder
        if (
            projectile.x >= CanvasWidth ||
            projectile.x <= 0 ||
            projectile.y >= CanvasHeight ||
            projectile.y <= 0
        ) {
            projectile.markedForDeletion = true;
        }

        //Enemy and Projectile Collision
        enemyArray.forEach(function (enemy, j) {
            const distance = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );
            const radiiSum = enemy.size + projectile.size;
            if (distance <= radiiSum) {
                emitParticle(
                    enemy.x,
                    enemy.y,
                    10,
                    enemy.color,
                    projectile.velX * 0.3,
                    projectile.velY * 0.3
                );
                emitParticle(
                    projectile.x,
                    projectile.y,
                    10,
                    "white",
                    projectile.velX * 0.15,
                    projectile.velY * 0.16
                );
                
                if (enemy.size > 10) {
                    enemy.size -= 5;
                } else {
                    enemy.markedForDeletion = true;
                
                }
                projectile.markedForDeletion = true;
            }
        });


        smartProjectileArray.forEach((sprojectile, i) => {
            const distance = Math.hypot(
                projectile.x - sprojectile.x,
                projectile.y - sprojectile.y
            );
            const radiiSum = sprojectile.size + projectile.size;
            if (distance <= radiiSum) {
                sprojectile.markedForDeletion = true;
                projectile.markedForDeletion = true;
            }
        });


        //Player and Projectile Collision
        const pDistance = Math.hypot(
            projectile.x - player.x,
            projectile.y - player.y
        );
        const pRadiiSum = projectile.size + player.size;
        if (pDistance <= pRadiiSum) {
            emitParticle(
                player.x,
                player.y,
                20,
                player.color,
                projectile.velX * 0.3,
                projectile.velY * 0.3
            );
            emitParticle(
                projectile.x,
                projectile.y,
                20,
                "white",
                projectile.velX * 0.15,
                projectile.velY * 0.16
            );
            projectile.markedForDeletion = true;
        }



        if (projectile.markedForDeletion) {
            projectileArray.splice(i, 1);
        }
    });



    smartProjectileArray.forEach((projectile, i) => {
        projectile.update();
        if (Math.random() < 0.3) {
            emitParticle(projectile.x, projectile.y, 1, projectile.color);
        }
        if (projectile.lifeTime <= 0) {
            projectile.markedForDeletion = true;
        }
        
        
        const pDistance = Math.hypot(
            projectile.x - player.x,
            projectile.y - player.y
        );
        const pRadiiSum = projectile.size + player.size;
        if (pDistance <= pRadiiSum) {
            emitParticle(
                player.x,
                player.y,
                20,
                player.color,
                projectile.velX * 0.3,
                projectile.velY * 0.3
            );
            emitParticle(
                projectile.x,
                projectile.y,
                20,
                "white",
                projectile.velX * 0.15,
                projectile.velY * 0.16
            );
            projectile.markedForDeletion = true;
        }
        
        
        if (projectile.markedForDeletion) {
            smartProjectileArray.splice(i, 1);
            emitParticle(projectile.x, projectile.y, 20, projectile.color);
        }
    });

    enemyArray.forEach((enemy, i) => {
        enemy.update();
        //enemyPassedBorders
        if (
            enemy.x > CanvasWidth + enemy.size * 2 ||
            enemy.x < -enemy.size * 2 ||
            enemy.y > CanvasHeight + enemy.size * 2 ||
            enemy.y < -enemy.size * 2
        ) {
            enemy.markedForDeletion = true;
        }

        if (enemy.markedForDeletion) {
            enemyArray.splice(i, 1);
        }
    });

    particleArray.forEach((particle, i) => {
        particle.update();
        if (particle.size <= 0.2) {
            particle.markedForDeletion = true;
        }
        if (particle.markedForDeletion) {
            particleArray.splice(i, 1);
        }
    });

    timeElapsed = delta - lastTimeFrame;
    lastTimeFrame = delta;

    Timers.forEach((timer) => {
        timer.update(timeElapsed);
    });

    drawControls();
    //debug();
    requestAnimationFrame(gameLoop);
}

function drawControls() {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(
        moveControl.touchStartPositionX,
        moveControl.touchStartPositionY
    );
    ctx.lineTo(moveControl.touchEndPositionX, moveControl.touchEndPositionY);
    ctx.stroke();
    ctx.strokeStyle = aimControl.power > 0.6 ? "red" : "lime";
    ctx.beginPath();
    ctx.moveTo(aimControl.touchStartPositionX, aimControl.touchStartPositionY);
    ctx.lineTo(aimControl.touchEndPositionX, aimControl.touchEndPositionY);
    ctx.stroke();
}

gameLoop();
