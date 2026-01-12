
//board
let board;
let boardWidth=360;
let boardHeight=640;
let context;

//bird
let birdWidth=34;
let birdHeight=24;
let birdX=boardWidth/8;
let birdY=boardHeight/2;
let birdImg;


let bird={
    x : birdX,
    y : birdY,
    width: birdWidth,
    height: birdHeight,
    velocityY: 0
}
//pipe
let pipeArray=[];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeGap = 200;
let pipeVelocityX = -1.5;


let topPipeImg;
let bottomPipeImg;


window.onload=function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    birdImg = new Image();
    birdImg.src = "./flappybird0.png";
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Wait for all images to load before starting
    let imagesLoaded = 0;
    let totalImages = 3;
    function checkAllLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            resetGame();
            update();
        }
    }
    birdImg.onload = checkAllLoaded;
    topPipeImg.onload = checkAllLoaded;
    bottomPipeImg.onload = checkAllLoaded;

    // fallback if images are cached
    if (birdImg.complete) imagesLoaded++;
    if (topPipeImg.complete) imagesLoaded++;
    if (bottomPipeImg.complete) imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame();
        update();
    }

    document.addEventListener("keydown", moveBird);
}


let gravity = 0.2;
let gameOver = false;
let score = 0;
let highScore = Number(localStorage.getItem('flappyHighScore')) || 0;

function update() {
    if (gameOver) {
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
        context.font = "40px Courier New";
        context.fillStyle = "red";
        context.fillText("Game Over", 70, boardHeight/2 - 20);
        context.font = "30px Courier New";
        context.fillStyle = "black";
        context.fillText("Score: " + score, 120, boardHeight/2 + 30);
        context.font = "25px Courier New";
        context.fillStyle = "#007700";
        context.fillText("High Score: " + highScore, 90, boardHeight/2 + 60);
        context.font = "20px Courier New";
        context.fillStyle = "black";
        context.fillText("Press Space to Restart", 70, boardHeight/2 + 100);
        return;
    }
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Move and draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += pipeVelocityX;
        // Draw top pipe
        context.drawImage(topPipeImg, pipe.x, pipe.y, pipeWidth, pipeHeight);
        // Draw bottom pipe
        context.drawImage(bottomPipeImg, pipe.x, pipe.y + pipeHeight + pipeGap, pipeWidth, pipeHeight);
    }

    // Add new pipes
    if (pipeArray.length > 0) {
        let lastPipe = pipeArray[pipeArray.length - 1];
        if (lastPipe.x < boardWidth - 200) {
            // Ensure the gap stays within the screen
            let minY = -pipeHeight + 50; // top pipe min y
            let maxY = boardHeight - pipeGap - 50 - pipeHeight; // bottom pipe max y
            let newY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
            pipeArray.push({
                x: boardWidth,
                y: newY
            });
        }
    }

    // Remove pipes that are off screen
    if (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
        score++;
    }

    // Bird physics
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Collision detection
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        // Top pipe
        if (collision(bird, {x: pipe.x, y: pipe.y, width: pipeWidth, height: pipeHeight})) {
            gameOver = true;
        }
        // Bottom pipe
        if (collision(bird, {x: pipe.x, y: pipe.y + pipeHeight + pipeGap, width: pipeWidth, height: pipeHeight})) {
            gameOver = true;
        }
    }
    // Ground or ceiling
    if (bird.y < 0 || bird.y + bird.height > boardHeight) {
        gameOver = true;
    }

    // Draw score
    context.font = "30px Courier New";
    context.fillStyle = "black";
    context.fillText("Score: " + score, 10, 50);
    context.font = "18px Courier New";
    context.fillStyle = "black";
    context.fillText("High Score: " + highScore, 10, 75);
}

function moveBird(e) {
    if (e.code === "Space" || e.key === " ") {
        if (gameOver) {
            resetGame();
            update();
            return;
        }
        bird.velocityY = -5.5;
    }
}

function collision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetGame() {
    bird.x = birdX;
    bird.y = birdY;
    bird.velocityY = 0;
    pipeArray = [
        {
            x: boardWidth,
            y: -pipeHeight/2
        }
    ];
    score = 0;
    gameOver = false;
}