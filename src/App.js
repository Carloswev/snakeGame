import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 5, y: 5 }];
const INITIAL_FOOD = { x: 10, y: 10 };
const DIRECTIONS = { UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT' };
const NUM_PHASES = 15;
const SPECIAL_FOOD_SCORE = 5; // Points for special food
const SPECIAL_FOOD_CHANCE = 0.1; // Chance of special food spawning

const getFoodStyle = (phase) => {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet', 'brown', 'grey'];
  return { backgroundColor: colors[phase % colors.length] };
};

const getBarrierPositions = (phase) => {
  const barriers = [];
  const barrierCounts = Math.min(phase + 1, 10); // Increase barriers with phases, max 10 barriers

  for (let i = 0; i < barrierCounts; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (barriers.some(b => b.x === x && b.y === y));
    barriers.push({ x, y });
  }

  return barriers;
};

const getMapBackground = (phase) => {
  const backgrounds = [
    'background1.jpg',
    'background2.jpg',
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.jpg',
    'background7.jpg',
    'background8.jpg',
    'background9.jpg',
    'background10.jpg',
    'background11.jpg',
    'background12.jpg',
    'background13.jpg',
    'background14.jpg',
    'background15.jpg'
  ];
  return `url(${process.env.PUBLIC_URL}/${backgrounds[phase % backgrounds.length]})`;
};

const getFoodType = () => {
  return Math.random() < SPECIAL_FOOD_CHANCE ? 'special' : 'normal';
};

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ ...INITIAL_FOOD, type: getFoodType() });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState(0);
  const [barriers, setBarriers] = useState(getBarrierPositions(0));
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('highScore')) || 0);

  const gameInterval = useRef(null);
  const speed = useRef(150);

  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== DIRECTIONS.DOWN) setNextDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
          if (direction !== DIRECTIONS.UP) setNextDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
          if (direction !== DIRECTIONS.RIGHT) setNextDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
          if (direction !== DIRECTIONS.LEFT) setNextDirection(DIRECTIONS.RIGHT);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const intervalId = setInterval(moveSnake, speed.current);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(intervalId);
    };
  }, [snake, direction, gameOver]);

  const moveSnake = () => {
    const newDirection = nextDirection;
    let newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (newDirection) {
      case DIRECTIONS.UP:
        head.y -= 1;
        break;
      case DIRECTIONS.DOWN:
        head.y += 1;
        break;
      case DIRECTIONS.LEFT:
        head.x -= 1;
        break;
      case DIRECTIONS.RIGHT:
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      if (score > highScore) {
        localStorage.setItem('highScore', score);
        setHighScore(score);
      }
      return;
    }

    newSnake = [head, ...newSnake.slice(0, -1)];

    if (head.x === food.x && head.y === food.y) {
      newSnake.push(newSnake[newSnake.length - 1]);
      setFood(generateFood());
      setScore(score + (food.type === 'special' ? SPECIAL_FOOD_SCORE : 1));

      if (score + 1 >= (phase + 1) * 5) {
        advancePhase();
      }
      
      // Increase speed with score
      if (score % 5 === 0) {
        speed.current = Math.max(50, speed.current - 5); // Increase speed, minimum 50ms interval
      }
    }

    setSnake(newSnake);
    setDirection(newDirection);
  };

  const checkCollision = (head) => {
    return (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      snake.some(segment => segment.x === head.x && segment.y === head.y) ||
      barriers.some(b => b.x === head.x && b.y === head.y)
    );
  };

  const generateFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: getFoodType()
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) || barriers.some(b => b.x === newFood.x && b.y === newFood.y));
    return newFood;
  };

  const advancePhase = () => {
    if (phase < NUM_PHASES - 1) {
      setPhase(phase + 1);
      setBarriers(getBarrierPositions(phase + 1));
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ ...INITIAL_FOOD, type: getFoodType() });
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setGameOver(false);
    setScore(0);
    setPhase(0);
    setBarriers(getBarrierPositions(0));
    speed.current = 150; // Reset speed
  };

  return (
    <div className="App">
      <div
        className="game-board"
        style={{ backgroundImage: getMapBackground(phase) }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="snake-segment"
            style={{
              left: `${(segment.x * 100) / GRID_SIZE}%`,
              top: `${(segment.y * 100) / GRID_SIZE}%`,
            }}
          />
        ))}
        {barriers.map((barrier, index) => (
          <div
            key={index}
            className="barrier"
            style={{
              left: `${(barrier.x * 100) / GRID_SIZE}%`,
              top: `${(barrier.y * 100) / GRID_SIZE}%`,
            }}
          />
        ))}
        <div
          className={`food ${food.type}`}
          style={{
            left: `${(food.x * 100) / GRID_SIZE}%`,
            top: `${(food.y * 100) / GRID_SIZE}%`,
            ...getFoodStyle(phase),
          }}
        />
      </div>
      <div className="score">
        Score: {score} | High Score: {highScore} | Phase: {phase + 1}
      </div>
      {gameOver && (
        <div className="game-over">
          <div>Game Over</div>
          <button onClick={resetGame}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
