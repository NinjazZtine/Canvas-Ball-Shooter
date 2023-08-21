const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let CanvasWidth = 1000;
let CanvasHeight = 800;
let WindowWidth = window.innerWidth;
let WindowHeight = window.innerHeight;

const button_click = document.getElementById('button_click');
const shoot = document.getElementById('shoot');
const no_ammo = document.getElementById('no_ammo');
const reload = document.getElementById('reload');
const enemy_death = document.getElementById('enemy_death');
const seeking_projectile_launch = document.getElementById('seeking_projectile_launch');
const bullet_impact = document.getElementById('bullet_impact');
const death_explosion = document.getElementById('death_explosion');
const actx = new AudioContext();

const bgImage = document.getElementById("bg");

const startScreen = document.querySelector(".startScreen");
const restartScreen = document.querySelector(".restartScreen");
const restartScreenScore = document.getElementById("score");
const restartScreenHighScore = document.getElementById("highscore");
const startBtn = document.querySelector(".startBtn");
const restartBtn = document.querySelector(".restartBtn");

const statusContainer = document.querySelector(".statusContainer");
const ScoreUi = document.getElementById("scoreUi");
const HighScoreUi = document.getElementById("highScoreUi");
const HealthUi = document.getElementById("healthValue");
const AmmoUi = document.getElementById("ammoValue");
const gridSize = 25;

class Player {
    constructor(x, y, size = 15, color = "white") {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.moving = false;
        this.knockVelX = 0;
        this.knockVelY = 0;
        this.color = color;
        this.hurtColor = "#ff0000ab";
        this.hurtFrames = 0;
        this.size = size;
        this.health = 100;
        this.ammo = 50;
        this.reloading = false;
        this.targetAngle = 0;
        this.targetX = 1;
        this.targetY = 0;
        this.onFireCooldown = false;
        this.isDead = false;
    }

    aim(angle) {
        this.targetAngle = angle;
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    knock(velX, velY) {
        if (this.isDead) return;
        this.knockVelX += velX;
        this.knockVelY += velY;
        this.hurtFrames = 5;
    }
    
    move(velX, velY) {
        if (this.isDead) return;
        this.moving = true;
        this.velX = velX;
        this.velY = velY;
    }

    fireProjectile() {
        if (this.isDead) return;
        if (!this.onFireCooldown) {
            if (this.ammo > 0) {
                const velX = this.targetX * (Math.random() * 2 - 1 + 10);
                const velY = this.targetY * (Math.random() * 2 - 1 + 10);
                const x = this.x + this.targetX * 20;
                const y = this.y + this.targetY * 20;
                
                playAudio(shoot, 0.2);
                
                projectileArray.push(new Projectile(x, y, velX, velY));
                this.ammo--;
                AmmoUi.style.width = this.ammo / 50 * 100 + "%";
                this.onFireCooldown = true;
            } else {
                playAudio(no_ammo, 0.2);
                if (!this.reloading) {
                    this.reloading = true
                    setTimeout(() => {
                        playAudio(reload, 0.8);
                        this.ammo = 50
                        this.reloading = false;
                    }, 2000);
                }
                this.onFireCooldown = true;
            }
        }
    }
    
    draw() {
        if (this.isDead) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        if (this.hurtFrames > 0) {
            ctx.fillStyle = this.hurtColor;
            ctx.fill();
            ctx.fillStyle = "#ff00005e";
            ctx.fillRect(-camera.x, -camera.y, canvas.width, canvas.height);
            this.hurtFrames--;
        }
        ctx.beginPath();
        ctx.lineWidth = this.size * 0.5;
        ctx.strokeStyle = "white";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.targetX * (this.size * 1.7), this.y + this.targetY * (this.size * 1.7));
        ctx.stroke();
    }

    update() {
        if (!this.moving) {
            if (Math.abs(this.velX) + Math.abs(this.velY) > 0.001) {
                this.velX *= 0.90;
                this.velY *= 0.90;
            } else {
                this.velX = 0;
                this.velY = 0;
            }
        }
        if (Math.abs(this.knockVelX) + Math.abs(this.knockVelY) > 0.001) {
            this.knockVelX *= 0.95;
            this.knockVelY *= 0.95;
        } else {
            this.knockVelX = 0;
            this.knockVelY = 0;
        }
        this.x += this.velX + this.knockVelX;
        this.y += this.velY + this.knockVelY;
        

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
        
        if (aimControl.isActive && aimControl.power > 0.6) {
            this.fireProjectile();
        }
        this.draw();
    }
}

class Enemy {
    constructor(x, y, velX = 0, velY = 0, size = 10, color = "red") {
        this.x = x;
        this.y = y;
        this.size = size;
        this.origSize = size;
        this.health = size;
        this.showHealth = false;
        this.velX = velX;
        this.velY = velY;
        this.knockVelX = 0;
        this.knockVelY = 0;
        this.color = color;
        this.hurtColor = "#fe0000aa";
        this.hurtFrames = 0;
        this.targetAngle = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.onFireCooldown = true;
        this.onFireCooldownSmart = true;
        this.markedForDeletion = false;
        this.isDead = false;
    }

    aim(target) {
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    knock(velX, velY) {
        this.knockVelX += velX;
        this.knockVelY += velY;
        this.hurtFrames = 5;
    }
    
    
    fireProjectile() {
        if (!this.onFireCooldown) {
            if (Math.random() < 0.05) {
                const velX = this.targetX * 4;
                const velY = this.targetY * 4;
                const x = this.x + this.targetX * 30;
                const y = this.y + this.targetY * 30;
                beep(0.02, 10, 5);
                projectileArray.push(new Projectile(x, y, velX, velY, "red"));
            }
            this.onFireCooldown = true;
        }
    }
    
    fireSmartProjectile(target) {
        if (smartProjectileArray.length > 6) return
        if (!this.onFireCooldownSmart) {
            if (Math.random() < 0.2) {
                playAudio(seeking_projectile_launch, Math.random() * 0.02 + 0.01);
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
        
        if (this.hurtFrames > 0) {
            ctx.fillStyle = this.hurtColor;
            ctx.fill();
            this.hurtFrames--;
        }
        
        ctx.beginPath();
        ctx.lineWidth = this.size * 0.5;
        ctx.strokeStyle = "white";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.targetX * (this.size * 1.7), this.y + this.targetY * (this.size * 1.7));
        ctx.stroke();
        
        if (this.showHealth) {
            const barLength = this.size * 2.5 + 2;
            const barX = this.x - barLength*0.5;
            const barY = this.y - (this.size + 18);
            ctx.fillStyle = "red";
            ctx.fillRect(barX, barY, Math.max(0, (this.health * 2.5)), 6);
            ctx.strokeStyle = "#a3a3a3";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barLength, 6);
        }
    }
    
    update() {
        if (Math.abs(this.knockVelX) + Math.abs(this.knockVelY) > 0.001) {
            this.knockVelX *= 0.95;
            this.knockVelY *= 0.95;
        } else {
            this.knockVelX = 0;
            this.knockVelY = 0;
        }
        this.x += this.velX + this.knockVelX;
        this.y += this.velY + this.knockVelY;
        this.aim(player);
        
        if (this.x + this.size > CanvasWidth) {
            this.velX = -this.velX;
            this.knockVelX = - this.knockVelX;
        } else if (this.x - this.size < 0) {
            this.velX = -this.velX;
            this.knockVelX = - this.knockVelX;
        }
        
        if (this.y + this.size > CanvasHeight) {
            this.velY = -this.velY;
            this.knockVelY = - this.knockVelY;
        } else if (this.y - this.size < 0) {
            this.velY = -this.velY;
            this.knockVelY = - this.knockVelY;
        }
        
        
        this.fireProjectile();
        this.fireSmartProjectile(player);
        if (this.isDead) {
            this.size -= 1;
        }
        if (this.size <= 0) {
            this.markedForDeletion = true;
        }
        this.draw();
    }
}

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
        this.velX = 0;
        this.velY = 0;
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
        this.velX = Math.cos(angle) * 1.8;
        this.velY = Math.sin(angle) * 1.8;
        this.x += this.velX;
        this.y += this.velY;
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

class Particle {
    constructor(x, y, color, speed, xVelOffset, yVelOffset) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 3 * speed * 0.1;
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

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    preRender() {
        const targetX = -player.x - player.targetX * 80 + ctx.canvas.width / 2;
        const targetY = -player.y - player.targetY * 80 + ctx.canvas.height / 2;
        const vectorX = targetX - this.x;
        const vectorY = targetY - this.y;
        this.x += vectorX * 0.04;
        this.y += vectorY * 0.04;
        ctx.save();
        ctx.translate(this.x, this.y);
    }
    postRender() {
        ctx.restore();
    }
}

class Timer {
    constructor(interval, cFunction) {
        this.timer = 0;
        this.interval = interval;
        this.cFunction = cFunction;
    }

    update(timeElapsed) {
        if (this.timer > this.interval) {
            this.cFunction();
            this.timer = 0;
        } else {
            this.timer += timeElapsed;
        }
    }
}

class GestureControl {
    constructor() {
        this.isActive = false;
        this.touchStartPositionX = 0;
        this.touchStartPositionY = 0;
        this.touchEndPositionX = 0;
        this.touchEndPositionY = 0;
        this.relativeX = 0;
        this.relativeY = 0;
        this.touchDistance = 0;
        this.angle = 0;
        this.power = 0;
        this.isActive = false;
    }

    updateValues() {
        this.touchDistance = Math.hypot(
            this.touchStartPositionX - this.touchEndPositionX,
            this.touchStartPositionY - this.touchEndPositionY
        );
        this.angle = Math.atan2(
            this.touchEndPositionY - this.touchStartPositionY,
            this.touchEndPositionX - this.touchStartPositionX
        );
        if (this.touchDistance > 75) {
            this.touchEndPositionX =
                75 * Math.cos(this.angle) + this.touchStartPositionX;
            this.touchEndPositionY =
                75 * Math.sin(this.angle) + this.touchStartPositionY;
            this.touchDistance = 75;
        }
        this.relativeX = this.touchEndPositionX - this.touchStartPositionX;
        this.relativeY = this.touchEndPositionY - this.touchStartPositionY;
        this.power = this.touchDistance / 75;
    }

    touchStart(x, y) {
        this.touchStartPositionX = x;
        this.touchStartPositionY = y;
        this.touchEndPositionX = x;
        this.touchEndPositionY = y;
        this.isActive = true;
    }

    touchMove(x, y) {
        this.touchEndPositionX = x;
        this.touchEndPositionY = y;
        this.updateValues();
    }

    touchEnd() {
        this.touchEndPositionX = 0;
        this.touchEndPositionY = 0;
        this.touchStartPositionX = 0;
        this.touchStartPositionY = 0;
        this.touchDistance = 0;
        this.power = 0;
        this.isActive = false;
    }
}

function createEnemy() {
    if (enemyArray.length > 5) return;
    if (Math.random() > 0.8) return;
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
    const x = Math.round(size + Math.random() * (CanvasWidth - size * 2));
    const y = Math.round(size + Math.random() * (CanvasHeight - size * 2));
    const angle = Math.atan2(player.y - y, player.x - x);
    const randomVel = Math.random() * 1 + 0.3;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
    const color = "hsl(" + Math.random() * 360 + "0,100%,70%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}

function emitParticle(x, y, multiplier, speed = multiplier, color = "white", xVelOffset = 0, yVelOffset = 0) {
    for (i = 0; i < multiplier; i++) {
        particleArray.push(
            new Particle(x, y, color, speed, xVelOffset, yVelOffset)
        );
    }
}

function playAudio(audio, volume = 1) {
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play();
}

function beep(vol, freq, duration) {
    v = actx.createOscillator();
    u = actx.createGain();
    v.connect(u);
    v.frequency.value = freq + 500;
    v.type = "square";
    u.connect(actx.destination);
    u.gain.value = vol;
    v.start(actx.currentTime);
    v.stop(actx.currentTime + duration * 0.001);
}

function drawGrid() {
    width = CanvasWidth / gridSize;
    height = CanvasHeight / gridSize;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.2;
    for (i = 0; i < width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, CanvasHeight);
        ctx.stroke();
    }
    for (i = 0; i < height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(CanvasWidth, i * gridSize);
        ctx.stroke();
    }
}

function drawBg() {
    ctx.drawImage(bgImage, 0, 0, CanvasWidth, CanvasHeight);
}

function kill() {
    playAudio(death_explosion, 1);
    player.isDead = true;
    emitParticle(player.x, player.y, 25, 19, player.color);
    setTimeout(() => {
        gameOver();
        return;
    }, 3000);
}

function gameStart() {
    player = new Player(
        Math.floor(Math.random() * CanvasWidth),
        Math.floor(Math.random() * CanvasHeight),
        15,
        "hsl(0,0%,66.8%)"
    );
    moveControl = new GestureControl();
    aimControl = new GestureControl();
    score = 0;
    ScoreUi.innerText = String(score);
    HealthUi.style.width = Math.max(2, player.health) + "%";
    AmmoUi.style.width = Math.max(2, (player.ammo / 50) * 100) + "%";
    
    Timers = [
        //enemySpawnRate
        new Timer(1000, createEnemy),
        //playerFireCooldown
        new Timer(150, () => {
            player.onFireCooldown = false;
        }),

        //enemyFireCooldown
        new Timer(200, () => {
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

        //fps counter
        new Timer(200, () => {
            ctx.fillStyle = "white";
            ctx.textAlign = "right";
            fps = Math.round(1000 / timeElapsed) + " FPS";
        }),
    ];
    smartProjectileArray = [];
    lastTimeFrame = 0;
    timeElapsed = 0;
    running = true;
    startScreen.style.visibility = "hidden";
    startScreen.style.opacity = 0;
    restartScreen.style.visibility = "hidden";
    restartScreen.style.opacity = 0;
    statusContainer.style.visibility = "visible";
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    running = false;
    Timers = [];
    lastTimeFrame = 0;
    timeElapsed = 0;
    player = {};
    if (score >= highScore) {
        highScore = score;
    }
    HighScoreUi.innerText = String(highScore);
    statusContainer.style.visibility = "hidden";
    restartScreenScore.innerText = String(score);
    restartScreenHighScore.innerText = String(highScore);
    restartScreen.style.visibility = "visible";
    restartScreen.style.opacity = 1;
    
}

//SETUP

const camera = new Camera();
let score = 0;
let highScore = 0;
let fps = 0;
let player;
let moveControl;
let aimControl;
let particleArray = [];
let projectileArray = [];
let smartProjectileArray = [];
let enemyArray = [];

let lastTimeFrame = 0;
let timeElapsed = 0;
let Timers = [];
let running = false;

function gameLoop(delta) {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.preRender();
    drawBg();
    drawGrid();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, CanvasWidth, CanvasHeight);
    player.update();

    //Projectile Loop
    for (let i = 0; i < projectileArray.length; i++) {
        const projectile = projectileArray[i];
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
        if (projectile.color === "white") {
            for (let j = 0; j < enemyArray.length; j++) {
                const enemy = enemyArray[j];
                const distance = Math.hypot(
                    projectile.x - enemy.x,
                    projectile.y - enemy.y
                );
                const radiiSum = enemy.size + projectile.size;
                if (distance <= radiiSum) {
                    emitParticle(
                        projectile.x,
                        projectile.y,
                        5,
                        5,
                        "white",
                        projectile.velX * 0.15,
                        projectile.velY * 0.16
                    );
                    enemy.health -= Math.floor(Math.random() * 3 + 3);
                    if (enemy.health > 0) {
                        enemy.showHealth = true;
                    } else {
                        if (!enemy.isDead) {
                            enemy.showHealth = false;
                            enemy.isDead = true;
                            playAudio(enemy_death, 0.5);
                            score += Math.round(Math.random() * 10 + enemy.origSize);
                            ScoreUi.innerText = String(score);
                        }
                    }
                    playAudio(bullet_impact, 0.05);
                    enemy.knock(projectile.velX * 0.2, projectile.velY * 0.2);
                    projectile.markedForDeletion = true;
                }
            }
        }

        //Projectile and smart projectile collisin
        if (projectile.color === "white") {
            for (let j = 0; j < smartProjectileArray.length; j++) {
                const sprojectile = smartProjectileArray[j];
                const distance = Math.hypot(
                    projectile.x - sprojectile.x,
                    projectile.y - sprojectile.y
                );
                const radiiSum = sprojectile.size + projectile.size;
                if (distance <= radiiSum) {
                    sprojectile.markedForDeletion = true;
                    projectile.markedForDeletion = true;
                }
            }
        }
        
        
        //Player and Projectile Collision
        if (projectile.color === "red") {
            if (!player.isDead) {
                const pDistance = Math.hypot(
                    projectile.x - player.x,
                    projectile.y - player.y
                );
                const pRadiiSum = projectile.size + player.size;
                if (pDistance <= pRadiiSum) {
                    emitParticle(
                        player.x,
                        player.y,
                        5,
                        10,
                        player.color,
                        projectile.velX * 0.3,
                        projectile.velY * 0.3
                    );
                    emitParticle(
                        projectile.x,
                        projectile.y,
                        5,
                        10,
                        "white",
                        projectile.velX * 0.15,
                        projectile.velY * 0.16
                    );
                    if (player.health > 0) {
                        playAudio(bullet_impact, 0.1);
                        player.knock(projectile.velX * 0.2, projectile.velY * 0.2);
                        player.health -= Math.random() * 4 + 3;
                        HealthUi.style.width = player.health + "%";
                    } else kill();
                    projectile.markedForDeletion = true;
                }
            }
        }

        if (projectile.markedForDeletion) {
            projectileArray.splice(i, 1);
            i--;
        }
    }

    //Smart Projectile Loop
    for (let i = 0; i < smartProjectileArray.length; i++) {
        const projectile = smartProjectileArray[i];
        projectile.update();
        if (Math.random() < 0.3) {
            emitParticle(projectile.x, projectile.y, 1, 2, projectile.color);
        }
        if (projectile.lifeTime <= 0) {
            projectile.markedForDeletion = true;
        }

        //Player and smartProjectile Collision
        if (!player.isDead) {
            const pDistance = Math.hypot(
                projectile.x - player.x,
                projectile.y - player.y
            );
            const pRadiiSum = projectile.size + player.size;
            if (pDistance <= pRadiiSum) {
                emitParticle(player.x, player.y, 7, 9, player.color, projectile.velX,
                    Projectile.velY);
                emitParticle(
                    projectile.x,
                    projectile.y,
                    12,
                    15,
                    projectile.color,
                    projectile.velX,
                    Projectile.velY
                );
                if (player.health > 0) {
                    playAudio(bullet_impact, 0.25);
                    player.knock(projectile.velX * 2, projectile.velY * 2);
                    player.health -= Math.random() * 10 + 10;
                    HealthUi.style.width = player.health + "%";
                } else kill();
                projectile.markedForDeletion = true;
            }
        }

        if (projectile.markedForDeletion) {
            smartProjectileArray.splice(i, 1);
            emitParticle(projectile.x, projectile.y, 8, 10, projectile.color);
        }
    }

    //Enemy Loop
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
            emitParticle(
                enemy.x,
                enemy.y,
                enemy.origSize,
                enemy.origSize,
                enemy.color
            );
            
            enemyArray.splice(i, 1);
        }
    });

    //Particle Loop
    for (let i = 0; i < particleArray.length; i++) {
        const particle = particleArray[i];
        particle.update();
        if (particle.size <= 0.2) {
            particle.markedForDeletion = true;
        }
        if (particle.markedForDeletion) {
            particleArray.splice(i, 1);
            i--;
        }
    }

    camera.postRender();

    timeElapsed = delta - lastTimeFrame;
    lastTimeFrame = delta;
    Timers.forEach((timer) => {
        timer.update(timeElapsed);
    });
    
    ctx.fillText(fps, canvas.width, 10);
    
    //drawing Controls
    
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
    
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", () => {
    if (running) return;
    playAudio(button_click, 0.5);
    gameStart();
});
restartBtn.addEventListener("click", () => {
    if (running) return;
    playAudio(button_click, 0.5);
    gameStart();
});

canvas.addEventListener("touchstart", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        if (x > WindowWidth / 2) {
            aimControl.touchStart(x, y);
        } else if (x < WindowWidth / 2) {
            moveControl.touchStart(x, y);
        }
    }
});

canvas.addEventListener("touchmove", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        if (x > WindowWidth / 2) {
            aimControl.touchMove(x, y);
            player.aim(aimControl.angle);
        } else if (x < WindowWidth / 2) {
            moveControl.touchMove(x, y);
            player.move(
                moveControl.relativeX * 0.05,
                moveControl.relativeY * 0.05
            );
        }
    }
});

canvas.addEventListener("touchend", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        if (x > WindowWidth / 2) {
            aimControl.touchEnd();
        } else if (x < WindowWidth / 2) {
            moveControl.touchEnd();
            player.moving = false;
        }
    }
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WindowWidth = window.innerWidth;
    WindowHeight = window.innerHeight;

});