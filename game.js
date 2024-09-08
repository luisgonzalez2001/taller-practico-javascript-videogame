const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');

const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');

const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const spanResult = document.querySelector('#result');

const btnRestart = document.querySelector('#restart');
const spanTimeF = document.querySelector('#mTime');
const spanRecordF = document.querySelector('#mRecord');
const pResult = document.querySelector('#mResult');

const gameConatiner = document.querySelector('#game-container')
const mFinally = document.querySelector('#finally');


let canvaSize;
let elementSize;
let level = 0;
let lives = 3;

let timeStart;
let timeInterval;

const posPlayer = {
    posX : undefined,
    posY : undefined
}

const posGift = {
    posX : undefined,
    posY : undefined
}

let posEnemy = [];

window.addEventListener('load', setCanvaSize);
window.addEventListener('resize', setCanvaSize);

btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

btnRestart.addEventListener('click', restartGame);

window.addEventListener('keydown', moveByKeys);

function resizeCanvaSize(size) {
    while ((size % 10) != 0) {
        size--;
    }
    return size;
}

function setCanvaSize () {
    if (window.innerHeight > window.innerWidth) {
        // canvaSize = window.innerWidth * 0.8;
        canvaSize = resizeCanvaSize(Math.floor(window.innerWidth * 0.7));
    } else {
        // canvaSize = window.innerHeight * 0.8;
        canvaSize = resizeCanvaSize(Math.floor(window.innerHeight * 0.7));
    }

    canvas.setAttribute('width', canvaSize);
    canvas.setAttribute('height', canvaSize);

    elementSize = (canvaSize / 10) - 1;

    startGame();
}

function startGame () {
    game.font = elementSize + 'px Verdana';
    game.textAlign = '';

    renderMap();
    
    movePlayer();

    // for (let row = 1; row <= 10; row++) {
    //     for (let col = 0; col < 10; col++) {
    //         game.fillText(emojis[mapCels[row - 1][col]], elementSize * col, elementSize * row);
    //     }
    // }
}

function renderMap () {
    clearMap();

    const map = maps[level];

    if(!map){
        gameWin();
        return;
    }

    if(!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    showLives();

    const mapRows = map.trim().split('\n');
    const mapCels = mapRows.map(row => row.trim().split(''));
    posEnemy = [];

    mapCels.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementSize * (colI);
            const posY = elementSize * (rowI + 1);
            game.fillText(emoji, posX, posY);

            if (col == 'O' && posPlayer.posX == undefined) {
                posPlayer.posX = posX;
                posPlayer.posY = posY;
            }

            if (col == 'I') {
                posGift.posX = posX;
                posGift.posY = posY;
            }

            if (col == 'X') {
                posEnemy.push({
                    posX : posX,
                    posY : posY
                })
            }
        })
    })
}

function moveUp () {
    if((posPlayer.posY - elementSize) < elementSize - 1) {
        console.log('OUT');
    } else {
        posPlayer.posY -= elementSize;
        renderMap();
        movePlayer();
    }
}   

function moveLeft () {
    if((posPlayer.posX - elementSize) < 0) {
        console.log('OUT');
    } else {
        posPlayer.posX -= elementSize;
        renderMap();
        movePlayer();
    }
}

function moveRight () {
    if(posPlayer.posX + elementSize >  elementSize * 9) {
        console.log('OUT');
    } else {
        posPlayer.posX += elementSize;
        renderMap();
        movePlayer();
    }
}

function moveDown () {
    if(posPlayer.posY + elementSize > elementSize * 10) {
        console.log('OUT');
    } else {
        posPlayer.posY += elementSize;
        renderMap();
        movePlayer();
    }
}

function moveByKeys (event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key == 'ArrowLeft') moveLeft();
    else if (event.key == 'ArrowRight') moveRight();
    else if (event.key == 'ArrowDown') moveDown();
}

function movePlayer() {
    huboColision();
    game.fillText(emojis['PLAYER'], posPlayer.posX, posPlayer.posY);
}

function clearMap () {
    game.clearRect(0,0,canvaSize,canvaSize);
}

function huboColision() {
    const giftColisionX = posPlayer.posX.toFixed(3) == posGift.posX.toFixed(3);
    const giftColisionY = posPlayer.posY.toFixed(3) == posGift.posY.toFixed(3);
    const giftColision = giftColisionX && giftColisionY;

    if(giftColision) {
        levelWin();
    }

    const enemyColision = posEnemy.find(enemy => {
        const enemyColsionX = posPlayer.posX.toFixed(3) == enemy.posX.toFixed(3);
        const enemyColsionY = posPlayer.posY.toFixed(3) == enemy.posY.toFixed(3);
        return enemyColsionX && enemyColsionY;
    })

    if(enemyColision) {
        levelFail();
    }
}

function levelWin () {
    console.log('Subiste de nivel');
    level++;
    renderMap();
}

function levelFail () {
    console.log('Lo siento, chocaste con una bomba');
    posPlayer.posX = undefined;
    posPlayer.posY = undefined;
    
    
    lives--;
    
    if(lives <= 0) {
        level = 0;
        lives = 3;
        timeStart = undefined;
        finishGame('Lo siento, perdiste todas las vidas :(');
    }
    
    renderMap();
}

function gameWin () {
    console.log('Felicidades, ganaste el juego');
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time');
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime) {
            localStorage.setItem('record_time', playerTime);
            finishGame('Felicidades, lograste un mejor record :)');
        }
        else {
            finishGame('Trata de superar el record para la proxima');
        }
    } else {
        localStorage.setItem('record_time', playerTime);
        finishGame('Primera vez?, trata de superar tu record');
    }

}

function showLives () {
    const heartsArray = Array(lives).fill(emojis['HEART']);

    spanLives.innerHTML = '';
    heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime () {
    spanTime.innerHTML = formatTime(Date.now() - timeStart);
}

function showRecord () {
    spanRecord.innerHTML = formatTime(localStorage.getItem('record_time'));
}

function formatTime(ms) {
    const cs = parseInt(ms / 10) % 100;
    const seg = parseInt(ms / 1000) % 60;
    const min = parseInt(ms / 60000) % 60;
    const hr = parseInt(ms / 3600000) % 24;

    const csStr = `0${cs}`.slice(-2);
    const segStr = `0${seg}`.slice(-2);
    const minStr = `0${min}`.slice(-2);
    const hrStr = `0${hr}`.slice(-2);

    return `${hrStr}:${minStr}:${segStr}:${csStr}`;
}

function finishGame (message) {
    pResult.innerHTML = message;
    spanRecordF.innerHTML = spanRecord.textContent;
    spanTimeF.innerHTML = spanTime.textContent;
    mFinally.style.display = 'flex';
    gameConatiner.style.display = 'none'
    document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';
}

function restartGame () {
    location.reload();
}