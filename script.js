const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const cellSize = 100;
const enemyImage = new Image();
enemyImage.src = './source/moonmonsters-happy.gif';
const maxTowers = 5; // 可以放置的最大塔数量
let currentTowers = 0; // 当前放置的塔数量

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
const maxEnemies = 10; // 最大敌人数量

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
    this.speed = 0.04;
    this.health = 100; // 敌人的生命值
    this.pathPosition = 0;
    this.dead = false; // 标记敌人是否死亡
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
    ctx.fillStyle = 'red';
    ctx.fillText(this.health, this.x * cellSize, this.y * cellSize);
  }

  update() {
    if (this.health <= 0) {
      this.dead = true; // 标记敌人为死亡
      this.imageElement.remove(); // 从DOM中移除图像元素
      return;
    }

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


class Tower {
  static showingRangeTower = null; // 正在显示范围的塔

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 150; // 攻击范围
    this.damage = 10; // 攻击伤害
    this.fireRate = 1000; // 攻击速度，以毫秒为单位
    this.target = null; // 当前目标敌人
    this.lastShotTime = 0; // 上次射击时间
    this.showingRange = false; // 是否正在显示这个塔的范围
    this.image = new Image();
    this.image.src = './source/arrow_tower.png'; // 设置图像的源
  }

  toggleRange() {
    this.showingRange = !this.showingRange;
  }
  

  findTarget(enemies) {
    for (let enemy of enemies) {
      let enemyX = enemy.x * cellSize + cellSize / 2;
      let enemyY = enemy.y * cellSize + cellSize / 2;
      let dx = this.x - enemyX;
      let dy = this.y - enemyY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.range) {
        this.target = enemy;
        return;
      }
    }
    this.target = null;
  }

  attack() {
    if (this.target && Date.now() - this.lastShotTime > this.fireRate) {
      this.target.health -= this.damage;
      this.lastShotTime = Date.now();
    }
  }

  draw() {
    // 使用图像替换填充的矩形
    ctx.drawImage(this.image, this.x - cellSize / 2, this.y - cellSize / 2, cellSize, cellSize);
    
    if (this.showingRange) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.range, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
  }
}


let towers = [];

canvas.addEventListener('click', function (e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  let gridX = Math.floor(x / cellSize);
  let gridY = Math.floor(y / cellSize);

  let clickedTower = null;
  towers.forEach(tower => {
    let dx = x - tower.x;
    let dy = y - tower.y;
    if (Math.sqrt(dx * dx + dy * dy) < cellSize / 2) {
      clickedTower = tower;
    }
  });

  if (clickedTower) {
    if (Tower.showingRangeTower === clickedTower) {
      clickedTower.showingRange = !clickedTower.showingRange; // 切换范围显示
      Tower.showingRangeTower = clickedTower.showingRange ? clickedTower : null;
    } else {
      if (Tower.showingRangeTower) {
        Tower.showingRangeTower.showingRange = false; // 关闭旧塔的范围显示
      }
      clickedTower.showingRange = true; // 显示新塔的范围
      Tower.showingRangeTower = clickedTower;
    }
  } else if (map[gridY] && map[gridY][gridX] === 0 && currentTowers < maxTowers) {
    towers.push(new Tower(gridX * cellSize + cellSize / 2, gridY * cellSize + cellSize / 2));
    currentTowers++;
  }
});



let enemies = [new Enemy()];

// 加载背景图片
const pathImage = new Image();
pathImage.src = './source/road.jpg'; // 设置图像的源

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        // 在路径上绘制背景图片
        ctx.drawImage(pathImage, x * cellSize, y * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = 'green'; // 空地颜色
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
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
    if (!enemy.dead && !enemy.reachedEnd) {
      enemy.draw();
    }
  });
  towers.forEach(tower => {
    tower.findTarget(enemies);
    tower.attack();
    tower.draw();
  });
  enemies = enemies.filter(enemy => !enemy.dead && !enemy.reachedEnd); // 移除死亡或到达终点的敌人

  // 检查生命值是否为0，如果是，则调用gameOver
  if (lives <= 0) {
    gameOver();
  }
  // 检查是否所有敌人都已被清除，并且生命值仍然大于0
  if (enemies.length === 0 && lives > 0) {
    gameWin();
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
  drawMap(); // 重新绘制地图
  drawLives(); // 重新绘制生命值
  towers.forEach(tower => tower.draw()); // 重新绘制塔
  ctx.fillStyle = 'black';
  ctx.font = '40px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
}


function gameWin() {
  clearInterval(gameInterval); // 清除游戏循环
  clearEnemies(); // 清除敌人图像元素
  drawMap(); // 重新绘制地图
  drawLives(); // 重新绘制生命值
  towers.forEach(tower => tower.draw()); // 重新绘制塔
  ctx.fillStyle = 'black';
  ctx.font = '40px Arial';
  ctx.fillText('You Win!', canvas.width / 2 - 100, canvas.height / 2);
}


