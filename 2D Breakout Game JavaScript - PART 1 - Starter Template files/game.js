////////////////////////////////////////////
//* BreakOut JavaScript - Code Explained *//
////////////////////////////////////////////
const canvas = document.getElementById("brickbreak");
const context = canvas.getContext("2d");

canvas.style.border = "1px solid #0ff";

// create paddle
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50;

const paddle = {
    x: canvas.width/2 - PADDLE_WIDTH/2,
    y: canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5, // amount of pixels the paddle will move to left or right
}

function drawPaddle() {
    context.fillStyle = "#2e3548";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    context.strokeStyle = "#ffcd05";
    context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// move the paddle
let leftArrow = false; // not pressed
let rightArrow = false; // not pressed
document.addEventListener("keydown", function(event) {
    if (event.keyCode == 37) { // left
        leftArrow = true; // pressed
    } else if (event.keyCode == 39) { // right
        rightArrow = true; // pressed
    }
});

document.addEventListener("keyup", function(event) {
    if (event.keyCode == 37) { // left
        leftArrow = false; // released
    } else if (event.keyCode == 39) { // right
        rightArrow = false; // released
    }
});

function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;
    } else if (leftArrow && paddle.x > 0) { // can't go smaller (though should probably make sure it isn't greater than 4)
        paddle.x -= paddle.dx;
    }
}

// create the ball
const BALL_RADIUS = 8;
const ball = {
    x: canvas.width/2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3
}

function drawBall(){
    context.beginPath();

    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    context.fillStyle = "#ffcd05";
    context.fill();

    context.strokeStyle = "#2e3548";
    context.stroke();

    context.closePath();
}

function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

let LIFE = 3;
function ballWallCollision() {
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = - ball.dx;
    }

    if(ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if(ball.y + ball.radius > canvas.height) { // bottom of canvas
        LIFE--;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

function ballPaddleCollision() {
    if (ball.y > paddle.y &&  ball.y < paddle.y + paddle.height
        && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        let collisionPoint = ball.x - (paddle.x + paddle.width / 2);
        let normalizedVal = collisionPoint / (paddle.width / 2);
        let angle = normalizedVal * Math.PI/3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }
}

const brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#2e3548",
    strokeColor : "#FFF"
}

let bricks = [];

function createBricks() {
    for(let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true // brick is not broken
            }
        }
    }
}

createBricks();

function drawBricks(){
    for(let r = 0; r < brick.row; r++) {
        for(let c = 0; c < brick.column; c++) {
            let bricky = bricks[r][c];
            if(bricky.status) { // if brick isn't broken
                context.fillStyle = brick.fillColor;
                context.fillRect(bricky.x, bricky.y, brick.width, brick.height);

                context.strokeStyle = brick.strokeColor;
                context.strokeRect(bricky.x, bricky.y, brick.width, brick.height);
            }
        }
    }
}

let SCORE = 0;
const SCORE_UNIT = 10;

// to expand: bricks need 2+ hits to be officially broken
function ballBrickCollision() {
    for(let r = 0; r < brick.row; r++) {
        for(let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if(b.status) { // if brick isn't broken
                if(ball.x + ball.radius > b.x
                    && ball.x - ball.radius < b.x + brick.width
                    && ball.y + ball.radius > b.y
                    && ball.y - ball.radius < b.y + brick.height) {
                    b.status = false; // the brick is broken
                    ball.dy = - ball.dy;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

function showGameStats(text, textX, textY, img, imgX, imgY){
    context.fillStyle = "#FFF";
    context.font = "25px Germania One";
    context.fillText(text, textX, textY);

    context.drawImage(img, imgX, imgY, width = 25, height = 25);
}

let GAME_OVER = false;

function gameOver() {
    if(LIFE <= 0) {
        showYouLose();
        GAME_OVER = true;
    }
}

let LEVEL = 1;
const MAX_LEVEL = 3;

function levelUp() {
    let isLevelDone = true;

    // check if all the bricks are broken
    for(let r = 0; r < brick.row; r++) {
        for(let c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    if(isLevelDone) {
        if(LEVEL >= MAX_LEVEL) {
            showYouWin();
            GAME_OVER = true;
            return;
        }
        // to expand: change paddle size
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

const gameover = document.getElementById("gameover");
const youwon = document.getElementById("youwon");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}

restart.addEventListener("click", function(){ // click on 'play again'
    location.reload();
})

function draw(){
    drawPaddle();
    drawBall();
    drawBricks();
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    showGameStats(LIFE, canvas.width - 25, 25, LIFE_IMG, canvas.width - 55, 5);
    showGameStats(LEVEL, canvas.width/2, 25, LEVEL_IMG, canvas.width/2 - 30, 5);
}

function update(){
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

// game loop
function loop() {
    // clear the canvas
    context.drawImage(BG_IMG, 0, 0);
    draw();
    update();
    if(!GAME_OVER){ // not true
        requestAnimationFrame(loop);
    }
}
loop();
