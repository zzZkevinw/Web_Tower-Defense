const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const cellSize = 100;
const enemyImage = new Image();
enemyImage.src = './source/moonmonsters-happy.gif';

let lives = 5;


const map = [
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
];

const path = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },

];

let enemyCount = 1;
const maxEnemies = 5; // 最大敌人数量

function addEnemy() {
  if (enemyCount < maxEnemies) {
    enemies.push(new Enemy());
    enemyCount++;
  }
}

setInterval(addEnemy, 2000); // 每2秒添加一个敌人

class Enemy {
  constructor() {
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = 0.05;
    this.pathPosition = 0;
    this.imageElement = document.createElement('img');
    this.imageElement.src = './source/moonmonsters-happy.gif';
    this.imageElement.style.position = 'absolute';
    this.imageElement.style.width = cellSize + 'px';
    this.imageElement.style.height = cellSize + 'px';
    this.imageElement.style.visibility = 'hidden';
    document.getElementById('game-container').appendChild(this.imageElement);
  }

  draw() {
    // 更新敌人GIF的位置
    this.imageElement.style.left = this.x * cellSize + 'px';
    this.imageElement.style.top = this.y * cellSize + 'px';
    this.imageElement.style.visibility = 'visible';
  }

  update() {
    if (this.pathPosition < path.length - 1) {
      let nextPos = path[this.pathPosition + 1];
      let dx = nextPos.x - this.x;
      let dy = nextPos.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let moveDistance = Math.min(this.speed, distance);
      this.x += (dx / distance) * moveDistance;
      this.y += (dy / distance) * moveDistance;
      if (distance <= this.speed) this.pathPosition++;
    } else {
      // 敌人到达终点
      lives--; // 减少生命值
      this.reachedEnd = true; // 标记敌人已到达终点
      this.imageElement.remove(); // 从DOM中移除图像元素
    }
  }
  
}



let enemies = [new Enemy()];

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = 'grey'; // 路径颜色
      } else {
        ctx.fillStyle = 'green'; // 空地颜色
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function drawLives() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Lives: ${lives}`, 10, 30);
}

// 存储setInterval的返回值
let gameInterval = setInterval(gameLoop, 25);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawLives();
  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  });
  enemies = enemies.filter(enemy => !enemy.reachedEnd); // 移除到达终点的敌人

  // 检查生命值是否为0，如果是，则调用gameOver
  if (lives <= 0) {
    gameOver();
  }
}

function clearEnemies() {
  enemies.forEach(enemy => {
    enemy.imageElement.remove();
  });
  enemies = [];
}

function gameOver() {
  clearInterval(gameInterval); // 清除游戏循环
  clearEnemies(); // 清除敌人图像元素
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
  drawMap();
  drawLives();
  // enemies.forEach(enemy => {
  //   enemy.draw(); // 绘制最后一次敌人
  // });
  ctx.fillStyle = 'black';
  ctx.font = '40px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
}

