// khởi tạo const
const GRID_EMPTY = 0;
const GRID_FOOD = 1;
const GRID_SNAKE = 2;
const GRID_OBSTACLE = 3;
const GRID_POISON = 4;
const initArraySize = 14;
const size = 38;

// khởi tạo element
const newGame = document.querySelector(".ended__button");
const highLevel = document.querySelector(".success__button");
const startGame = document.getElementById("start");
const homeElement = document.querySelector(".home");
const musicIcon = document.querySelector(".fa-music");
const volumn = document.querySelector(".fa-volume-high");
const slashElement = document.querySelector(".slash");
const levelSelect = document.getElementById('level');
const scoreElement = document.getElementById("score");
const aboutElement = document.querySelector(".about");
const aboutBtn = document.getElementById("about-me");
const closeAbout = document.getElementById("close");

// khởi tạo audio
let eatSound = new Audio('assets/eat.wav');
let homeSound = new Audio('assets/snake.mp3');
homeSound.loop = true;

let initArray = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
let snake = [
    {
        x: Math.floor(initArraySize / 2) - 1,
        y: Math.floor(initArraySize / 2)
    }
];
let snakeDirection
let score = 0;
let isGameOver = false;
let isGameStarted = false;
let newDirection;
let level = 1;
let speed = 200;
let obstacles = [];
let poison = { x: 0, y: 0 };
let foods = [];
let foodIntervalId;
let success = false;

// Bắt đầu game
window.onload = () => {
    startGame.addEventListener('click', () => {
        homeElement.style.display = "none";
        homeSound.play();
    })
    if (level >= 3) {
        initObstacles();
    }
    initFoods();
    render();
    if (level >= 4) {
        initPoison();
    }

    levelSelect.addEventListener('change', function() {
        if (!isGameStarted) {
            level = parseInt(this.value);
            console.log(level)
            if (level >= 3) {
                initObstacles();
            }else{
                obstacles = [];
            }
            initFoods();
            render();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (isGameOver) return;
        // lv 5 và 6 thì sẽ đảo ngược điều khiển
        if (level !== 5 && level !== 6) {
            if (event.code === 'ArrowLeft' && snakeDirection !== 'RIGHT') newDirection = 'LEFT';
            else if (event.code === 'ArrowUp' && snakeDirection !== 'DOWN') newDirection = 'UP';
            else if (event.code === 'ArrowRight' && snakeDirection !== 'LEFT') newDirection = 'RIGHT';
            else if (event.code === 'ArrowDown' && snakeDirection !== 'UP') newDirection = 'DOWN';
        } else {
            if (event.code === 'ArrowRight' && snakeDirection !== 'LEFT') newDirection = 'LEFT';
            else if (event.code === 'ArrowDown' && snakeDirection !== 'UP') newDirection = 'UP';
            else if (event.code === 'ArrowLeft' && snakeDirection !== 'RIGHT') newDirection = 'RIGHT';
            else if (event.code === 'ArrowUp' && snakeDirection !== 'DOWN') newDirection = 'DOWN';
        }

        // nếu có hướng mới và game chưa bắt đầu thì bắt đầu game
        if (newDirection && !isGameStarted) {
            snakeDirection = newDirection;
            isGameStarted = true;
            gameLoop();
        } else if (newDirection) {
            snakeDirection = newDirection;
        }
    });
    newGame.addEventListener('click', () => {
        restart()
    })

    highLevel.addEventListener('click', () => {
        restart()
    })

    musicIcon.addEventListener('click', playHomeSound)
    slashElement.addEventListener('click', playHomeSound)

    volumn.addEventListener('click', () => {
        if (eatSound.muted) {
            eatSound.muted = false;
            volumn.classList.add("fa-volume-high")
            volumn.classList.remove("fa-volume-mute")
        } else {
            eatSound.muted = true;
            volumn.classList.add("fa-volume-mute")
            volumn.classList.remove("fa-volume-high")
        }

    })

    aboutBtn.addEventListener('click', () => {
        aboutElement.style.top = "0"
    })

    closeAbout.addEventListener('click', () => {
        aboutElement.style.top = "-100%"
    })
};

const playHomeSound = () => {
    if (homeSound.paused) {
        homeSound.play();
        slashElement.style.display = "none"
    } else {
        homeSound.pause();
        slashElement.style.display = "block"

    }
}

const gameLoop = () => {
    if (!isGameOver && updateSnakePosition()) {
        scoreElement.innerHTML = score;
        render();
        setTimeout(gameLoop, speed);
        levelSelect.disabled = true
        if (!foodIntervalId && (level === 4 || level === 6)) {
            foodIntervalId = setInterval(initFoods, 2000);
        }

    } else if (isGameOver) {
        if (foodIntervalId) {
            clearInterval(foodIntervalId);
            foodIntervalId = null;
        }
        // nêu game over thì reset lại game
        isGameStarted = false;
        levelSelect.disabled = false
    }
};

// xóa bảng và render lại mỗi lần mình update đảm bảo cập nhật view.
const render = () => {
    // đầu tiên clear all
    initArray = initArray.map(() => Array(initArraySize).fill(0));

    obstacles.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_OBSTACLE;
    });

    foods.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_FOOD;
    });

    snake.forEach(part => {
        const { x, y } = part;
        initArray[x][y] = GRID_SNAKE;
    });


    const board = document.getElementById('board');
    const borderSize = 1;
    board.style.height = `${initArray.length * size + borderSize}px`;
    board.style.width = `${initArray[0].length * size + borderSize}px`;

    initArray.forEach((row, indexRow) => {
        row.forEach((cell, indexCol) => {
            const cellElement = document.createElement('div');
            let color = '';
            if (cell === GRID_OBSTACLE) {
                color = '#141e05'
            } else if (cell === GRID_POISON) {
                color = '#2a218a'
            } else if (indexRow % 2 === indexCol % 2) {
                color = '#aad751'
            } else {
                color = '#a2d149'
            }
            if (cell === GRID_FOOD) {
                cellElement.classList.add('food');
            } else if (cell === GRID_SNAKE) {
                cellElement.classList.add('snake');
            }

        cellElement.style.cssText = `
        position: absolute;  
        width: ${size + 1}px;  
        height: ${size + 1}px;  
        top: ${indexRow * size}px;  
        left: ${indexCol * size}px;  
        background-color: ${color};
        `;
        if (level === 2 || level === 6) {
            const border = '2px solid red';
            if (indexRow === 0) {
                cellElement.style.borderTop = border;
            }
            if (indexRow === initArray.length - 1) {
                cellElement.style.borderBottom = border;
            }
            if (indexCol === 0) {
                cellElement.style.borderLeft = border;
            }
            if (indexCol === row.length - 1) {
                cellElement.style.borderRight = border;
            }
        }
        board.appendChild(cellElement);
        });
    });
};

const updateSnakePosition = () => {
    const head = { ...snake[0] };

    switch (snakeDirection) {
        case 'RIGHT':
            head.y += 1;
            if (head.y >= initArraySize && (level !== 2 && level !== 6)) head.y = 0;
            break;
        case 'LEFT':
            head.y -= 1;
            if (head.y < 0 && (level !== 2 && level !== 6)) head.y = initArraySize - 1;
            break;
        case 'UP':
            head.x -= 1;
            if (head.x < 0 && (level !== 2 && level !== 6)) head.x = initArraySize - 1;
            break;
        case 'DOWN':
            head.x += 1;
            if (head.x >= initArraySize && (level !== 2 && level !== 6)) head.x = 0;
            break;
        default: break;
    }

    // Check đụng vào tường
    if (head.x < 0 || head.x >= initArraySize  || head.y < 0 || head.y >= initArraySize) {
        console.log("hihi")
        ended('Game Over: Snake hit a wall!')
        return false;
    }

    // Check đụng bản thân
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            ended('Game Over: Snake collided with itself!')
            return false;
        }
    }

    // Check đụng vào chướng ngại vật
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            ended('Game Over: Snake hit an obstacle!');
            return false;
        }
    }

    let ateFood = false;
    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            score++;
            foods.splice(i, 1);
            createFood();
            ateFood = true;
            if (!eatSound.muted) {
                let soundClone = eatSound.cloneNode();
                soundClone.play();
            }
            break;
        }
    }

    snake.unshift(head);
    if (!ateFood) {
        snake.pop();
    }

    if (score >= 10) {
        successPass('You win!')
        success = true
    }

    return true;
};

const ended = (notification) => {
    isGameOver = true;
    isGameStarted = false;

    const endedElement = document.querySelector(".ended")
    const notificationElement = document.querySelector(".ended__notification")
    const gameOverElement = document.querySelector(".ended__game-over")

    gameOverElement.innerHTML = notification
    endedElement.classList.add("ended--show")
    notificationElement.classList.add("ended__notification--show")

    snakeDirection = null
    newDirection = null
}
const successPass = (notification) => {
    isGameOver = true;
    isGameStarted = false;

    const endedElement = document.querySelector(".success")
    const notificationElement = document.querySelector(".success__notification")
    const gameOverElement = document.querySelector(".success__game-over")

    gameOverElement.innerHTML = notification
    endedElement.classList.add("success--show")
    notificationElement.classList.add("success__notification--show")
}


const restart = () => {
    isGameOver = false;

    snake = [
        {
            x: Math.floor(initArraySize / 2) - 1,
            y: Math.floor(initArraySize / 2)
        }
    ];

    score = 0;
    snakeDirection = undefined
    scoreElement.innerHTML = score;

    if (success) {
        const successElement = document.querySelector(".success");
        const notificationElement = document.querySelector(".success__notification");
        successElement.classList.remove("success--show");
        notificationElement.classList.remove("success__notification--show");
        if (level < 6) {
            level++;
            levelSelect.value = level;
        }
        success = false
    }else {
        const endedElement = document.querySelector(".ended");
        const notificationElement = document.querySelector(".ended__notification");
        endedElement.classList.remove("ended--show");
        notificationElement.classList.remove("ended__notification--show");
    }


    obstacles = [];
    if (level >= 3) {
        initObstacles();
    }
    initFoods()
    render()
}

function initObstacles() {
    for (let i = 0; i < initArray.length; i++) {
        let x, y;
        if (i === 2 || i === 3 || i === 4) continue;
        x = 3;
        y = i;// Ensure an empty position
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }

    for (let i = 0; i < initArray.length; i++) {
        let x, y;
        if (i === 11 || i === 12 || i === 13) continue;
        x = 8;
        y = i;// Ensure an empty position
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }

    for (let i = 0; i < initArray.length; i++) {
        let x, y;
        if (i === 6 || i === 7 || i === 8) continue;
        x = 12;
        y = i;
        obstacles.push({ x, y });
        initArray[x][y] = GRID_OBSTACLE;
    }
}

const initPoison = () => {
    let x, y;
    do {
        x = Math.floor(Math.random() * initArraySize);
        y = Math.floor(Math.random() * initArraySize);
    } while (initArray[x][y] !== GRID_EMPTY);

    poison = { x, y };
    initArray[x][y] = GRID_POISON;
};

const initFoods = () => {
    foods = [];
    for (let i = 0; i < 5; i++) { // Create 5 foods
        let x, y;
        do {
            x = Math.floor(Math.random() * initArraySize);
            y = Math.floor(Math.random() * initArraySize);
        } while (initArray[x][y] !== GRID_EMPTY);

        foods.push({ x, y });
        initArray[x][y] = GRID_FOOD;
    }

};

const createFood = () => {
    let x, y;
    do {
        x = Math.floor(Math.random() * initArraySize);
        y = Math.floor(Math.random() * initArraySize);
    } while (initArray[x][y] !== GRID_EMPTY);

    foods.push({ x, y });
    initArray[x][y] = GRID_FOOD;
};
