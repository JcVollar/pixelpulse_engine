const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const keys = {};
const bullets = [];
let mouseButtonDown = false;
const fireRate = 100; // Rate in milliseconds, lower value for faster firing
let lastFireTime = 0;
const gridSize = 20;
const mousePosition = { x: 0, y: 0 };
 

function init(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}
 
const camera = {
    x: 0,
    y: 0,
    update: function () {
        this.x = player.x - canvas.width / 2;
        this.y = player.y - canvas.height / 2;
    }
};

function fireBullet() {
    const angle = getMouseAngle();
    bullets.push(new Bullet(player.x, player.y, angle, 10, 'yellow'));
}

class GameObject {
     
    constructor(type, x, y, width, height, color) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    isColliding(other) {
		// Adjust the player's position if it's the player object
		let adjustedX = this.x - (this.type === "player" ? this.width / 2 : 0);
		let adjustedY = this.y - (this.type === "player" ? this.height / 2 : 0);
		
		let rightEdgeThis = adjustedX + this.width;
		let rightEdgeOther = other.x + other.width;
		let bottomEdgeThis = adjustedY + this.height;
		let bottomEdgeOther = other.y + other.height;
		
		return !(adjustedX >= rightEdgeOther || 
				 rightEdgeThis <= other.x || 
				 adjustedY >= bottomEdgeOther || 
				 bottomEdgeThis <= other.y); 
	}

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    }
}

class Player extends GameObject {

    health = 100;
    damage = 25;

    constructor(x, y, size, speed) {
        super("player", x, y, size, size, 'blue');
        this.speed = speed;
    }

    move(dx, dy) {
        // Handle x-axis movement
        const newX = this.x + dx * this.speed;
        const potentialXPosition = new GameObject("player", newX, this.y, this.width, this.height);
        if (!this.checkCollision(potentialXPosition)) {
            this.x = newX;
        }

        // Handle y-axis movement
        const newY = this.y + dy * this.speed;
        const potentialYPosition = new GameObject("player", this.x, newY, this.width, this.height);
        if (!this.checkCollision(potentialYPosition)) {
            this.y = newY;
        }
    }

    checkCollision(potentialPosition) {
		 
        for (const obj of gameObjects) {
            if (potentialPosition.isColliding(obj)) {
                return true;
            }
        }
        return false;
    }

     
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            gameOver();
        }
    }
}

class Bullet extends GameObject {

    distanceTraveled = 0;


    constructor(x, y, angle, speed, color) {
        const width = 4;
        const height = 4;
        super("bullet", x - width / 2, y - height / 2, width, height, color);
        this.speed = speed;
        this.angle = angle;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.distanceTraveled += this.speed;

        if (this.distanceTraveled >= 500) {
            this.shouldRemove = true;
        }
    }
}

class Enemy extends GameObject {

    detectionDistance = 500;
    speed = 1.3;
    health = 3; // Adjust this value to change the number of hits required to stop the enemy
    opacity = 1;

    constructor(x, y, width, height, color) {
        super("enamy", x, y, width, height, color);
        this.originalColor = color;
        this.hit = false;
        this.health = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
         
    }

    onBulletHit() {
        this.health--;

        if (this.health <= 0 && !this.hit) {
            this.hit = true;
            this.color = 'purple';
        }
    }

    update() {
        if (!this.hit) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.detectionDistance) {
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;

                if (this.isColliding(player)) {
                    player.takeDamage(this.damage);
                }
            }
        }
        if (this.hit) {
            this.opacity -= 0.01; // Adjust this value to change the fading speed
            if (this.opacity <= 0) {
                this.shouldRemove = true;
            }
        }
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }

}

function drawFogOfWar(ctx) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 400; // Adjust this value to change the field of view radius

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function isWithinFogRadius(object) {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const objectCenterX = object.x + object.width / 2;
    const objectCenterY = object.y + object.height / 2;

    const fogRadius = 400; // Make sure this matches the radius value in drawFogOfWar

    const distanceX = playerCenterX - objectCenterX;
    const distanceY = playerCenterY - objectCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    return distance <= fogRadius;
}

function getMouseAngle() {
    const rect = canvas.getBoundingClientRect();
    const mouseX = mousePosition.x - rect.left - canvas.width / 2;
    const mouseY = mousePosition.y - rect.top - canvas.height / 2;
    return Math.atan2(mouseY, mouseX);
}

function gameOver() {
    // Game over logic, e.g., show a message or restart the game
    console.log("Game Over!");
}
 
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('mousedown', () => {
    mouseButtonDown = true;
});

canvas.addEventListener('mouseup', () => {
    mouseButtonDown = false;
});
 
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;
});

function handleInput() {
    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;

    player.move(dx, dy);
}

function update() {
    handleInput();
    if (mouseButtonDown && Date.now() - lastFireTime >= fireRate) {
        fireBullet();
        lastFireTime = Date.now();
    }

    gameObjects.forEach((obj, index) => {
        if (obj instanceof Enemy) {
            obj.update();

            if (obj instanceof Enemy && obj.shouldRemove) {
                gameObjects.splice(index, 1);
                return;
            }
        }
    });
    
    bullets.forEach((bullet, index) => {
        bullet.update();

        // Remove the bullet when it has traveled 100 pixels or more
        if (bullet.shouldRemove) {
            bullets.splice(index, 1);
            return;
        }


        gameObjects.forEach((obj) => {
            if (obj.isColliding(bullet)) {
                if (obj instanceof Enemy) {
                    obj.onBulletHit();
                }
                bullets.splice(index, 1); // Remove the bullet when it hits a game object
            }
        });

        if (bullet.x < camera.x - 100 || bullet.y < camera.y - 100 ||
            bullet.x > camera.x + canvas.width + 100 || bullet.y > camera.y + canvas.height + 100) {
            bullets.splice(index, 1);
        }
    });
}
  
function render() {
	   
    // Update the camera position
    camera.update();

    // Clear the canvas
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    gameObjects.forEach((obj) => {
        if (obj instanceof Enemy && !isWithinFogRadius(obj)) {
            return;
        }
        obj.render(ctx);
    });
    

    bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x - camera.x , bullet.y - camera.y , bullet.width, bullet.height);
    });

    // Draw the player at the center
    ctx.fillStyle = player.color;
	ctx.fillRect(canvas.width / 2 - player.width/ 2 , canvas.height / 2 - player.height/ 2 , player.width , player.height);

    drawFogOfWar(ctx);

}

function generateRandomEnemies(count) {
    const enemies = [];

    for (let i = 0; i < count; i++) {
        const x = Math.random() * 2000; // Adjust the range as needed
        const y = Math.random() * 2000; // Adjust the range as needed
        const enemy = new Enemy(x, y, 20, 20, 'grey');
        enemies.push(enemy);
    }

    return enemies;
}

function generateRandomTrees(count) {
    const trees = [];

     for (let i = 0; i < count; i++) {
		 
        const x = snapToGrid(Math.random() * 1500, 20) ; // Adjust the range as needed
        const y = snapToGrid(Math.random() * 1500, 20); ; // Adjust the range as needed
		
		 
		
        const tree = new GameObject("tree", x, y, 20 ,20, 'darkgreen');
        trees.push(tree);
    } 
	
 
	 

    return trees;
}

function snapToGrid(coordinate, gridSize) {
    return Math.round(coordinate / gridSize) * gridSize;
}


const randomEnemies =  generateRandomEnemies(50);
const randomTrees = generateRandomTrees(100);

const gameObjects = [
    // ... any predefined game objects
   ...randomEnemies,
    ...randomTrees,
    
];

const player = new Player(400, 300, 20, 5);
init();
gameLoop();