//board
let button;
let tileSize = 32;
let row = 16;
let column = 16;

let board;
let boardWidth = tileSize * column;
let boardHeight = tileSize * row;
let context;

//ship
let shipImg;
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = boardWidth / 2 - tileSize;
let shipY = boardHeight - 2 * tileSize;
let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

//bullet
let bulletArray = [];
let bulletWidth = 5;
let bulletHeight = tileSize;
let bulletX = ship.x + tileSize;
let bulletY = ship.y - 30;

//aliens
let alienImg;
let alienArray = [];
let alienTotal = 0;
let alienRow = 1;
let alienColumn = 2;
let alienWidth = 2 * tileSize;
let alienHeight = tileSize;

//physics
let shipVelocityX = tileSize;
let bulletVelocityY = -10;
let alienVelocityX = 2;

//booleans
let alienReverse = false;
let score = 0;
let gameOver = false;

//Sounds
let shoot = new Audio("assets/shoot.wav");
let alienDeath = new Audio("assets/enemy-death.wav");
let gameoverSound = new Audio("assets/gameoverSound.wav");

//start game
window.onload = function () {
    //board
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;

    context = board.getContext("2d");


    //button
    button = document.getElementById("playAgain"); 

    //shipImg
    shipImg = new Image();
    shipImg.src = "assets/ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    //alien img
    alienImg = new Image();
    alienImg.src = "assets/alien.png";


    makeAliens();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", bulletMove);
    button.addEventListener("click", playAgain);
}

//frame per second fn
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        context.fillStyle = "white";
        context.font = "35px courier";
        context.fillText("GAME OVER", boardWidth / 2 - 3 * tileSize, boardHeight / 2);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //shipimg
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //bullet firing
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        if (bullet.used == false) {
            bullet.y += bulletVelocityY;
            context.fillStyle = "white";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }

    //alien
    if (alienReverse) {
        for (let i = 0; i < alienArray.length; i++) {
            let alien = alienArray[i];
            if (alien.alive) {
                alien.x -= alienVelocityX;
                context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);
                if (alien.x == 0) {
                    alienReverse = false;
                }

                if (alien.y === ship.y) {
                    gameOver = true;
                    gameoverSound.play();
                }
            }
        }
        if (alienReverse == false) {
            for (let i = 0; i < alienArray.length; i++) {
                let alien = alienArray[i];
                alien.y += alien.height;
            }
        }

    } else {
        for (let i = 0; i < alienArray.length; i++) {
            let alien = alienArray[i];

            if (alien.alive) {
                alien.x += alienVelocityX;
                context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);
                if (alien.x + alien.width == boardWidth) {
                    alienReverse = true;
                }
                if (alien.y === ship.y) {
                    gameOver = true;
                    gameoverSound.play();
                }
            }
        }

        if (alienReverse) {
            for (let i = 0; i < alienArray.length; i++) {
                let alien = alienArray[i];
                alien.y += alien.height;
            }
        }
    }


    //collision detection
    for (let i = 0; i < bulletArray.length; i++) {
        for (let j = 0; j < alienArray.length; j++) {
            let bullet = bulletArray[i];
            let alien = alienArray[j];
            if (bullet.used === false && alien.alive && detectCollision(bullet, alien)) {
                alienDeath.play();
                bullet.used = true;
                alien.alive = false;
                alienTotal--;
                score++;
                if (alienTotal === 0) {
                    alienArray = [];
                    bulletArray = [];
                    alienRow++;
                    alienColumn++;
                    makeAliens();
                }
            }

        }
    }

    //score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(`score: ${score}`, 20, 30);

}

//alienMakers
function makeAliens() {

    for (let alienY = tileSize; alienY <= tileSize + tileSize * alienRow; alienY += alienHeight) {
        for (let alienX = 0; alienX <= alienWidth * alienColumn; alienX += alienWidth) {
            let alien = {
                img: alienImg,
                x: alienX,
                y: alienY,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }

            alienArray.push(alien);
        }
    }

    alienTotal = alienArray.length;
}


function moveShip(e) {

    if (e.code == "ArrowLeft" && ship.x > 0) {
        ship.x -= shipVelocityX;
    }
    else if (e.code == "ArrowRight" && ship.x + ship.width < board.width) {
        ship.x += shipVelocityX;
    }
}

function bulletMove(e) {

    if (e.code == "ArrowUp" || e.code == "Space") {
        if(gameOver === false){
            shoot.play();
        }
       
        let bullet = {
            x: ship.x + tileSize,
            y: bulletY,
            width: bulletWidth,
            height: bulletHeight,
            used: false
        }

        bulletArray.push(bullet);
        if (bulletArray.length > 15) {
            bulletArray.shift();
        }
    }
}

//reset game fn
function playAgain() {
    score = 0;
    bulletArray = [];
    alienArray = [];
    alienRow = 1;
    alienColumn = 2;
    gameOver = false;
    alienReverse = false;
    ship.x = shipX;
    makeAliens();
}


function detectCollision(a, b) {
    if (!(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height)) {
        return true;
    }
    return false;
}
