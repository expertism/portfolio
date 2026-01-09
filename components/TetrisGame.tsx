import React, { useEffect, useRef, useState } from "react";
import { X, Trophy } from "lucide-react";

interface TetrisGameProps {
  onClose: () => void;
  retryable?: boolean;
}

const ROWS = 20;
const COLS = 20;
const BLOCK_SIZE = 10;
const SPEED = 400;

const SHAPES = [
  // I
  [[1, 1, 1, 1]],
  // O
  [
    [1, 1],
    [1, 1],
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];

const COLORS = [
  "#06b6d4",
  "#f59e42",
  "#f43f5e",
  "#a3e635",
  "#fbbf24",
  "#6366f1",
  "#f472b6",
];

function randomShape() {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], color: COLORS[idx], idx };
}

function rotate(matrix: number[][]) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
}

function checkCollision(
  board: number[][],
  shape: number[][],
  pos: { x: number; y: number }
) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newY = pos.y + y;
        const newX = pos.x + x;
        if (
          newY >= ROWS ||
          newX < 0 ||
          newX >= COLS ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export default function TetrisGame({ onClose, retryable }: TetrisGameProps) {
  const [board, setBoard] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [current, setCurrent] = useState(() => {
    const { shape, color, idx } = randomShape();
    return { shape, color, idx, pos: { x: 3, y: -2 } };
  });
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() =>
    Number(localStorage.getItem("tetris_high") || 0)
  );
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!started || gameOver || paused) return;
    const interval = setInterval(() => {
      move(0, 1);
    }, SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [started, gameOver, paused, current, board]);

  function merge(
    board: number[][],
    shape: number[][],
    pos: { x: number; y: number },
    idx: number
  ) {
    const newBoard = board.map((row) => [...row]);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = pos.y + y;
          const newX = pos.x + x;
          if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
            newBoard[newY][newX] = idx + 1;
          }
        }
      }
    }
    return newBoard;
  }

  function clearLines(board: number[][]) {
    let cleared = 0;
    const newBoard = board.filter((row) => {
      if (row.every((cell) => cell)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }
    if (cleared) setScore((s) => s + cleared * 100);
    return newBoard;
  }

  function move(dx: number, dy: number) {
    if (gameOver) return;
    const { shape, color, idx, pos } = current;
    const newPos = { x: pos.x + dx, y: pos.y + dy };
    if (!checkCollision(board, shape, newPos)) {
      setCurrent({ shape, color, idx, pos: newPos });
    } else if (dy === 1) {
      // Merge and spawn new
      const merged = merge(board, shape, pos, idx);
      const cleared = clearLines(merged);
      setBoard(cleared);
      const next = randomShape();
      const startPos = { x: 3, y: -2 };
      if (checkCollision(cleared, next.shape, startPos)) {
        setGameOver(true);
        if (score > high) {
          setHigh(score);
          localStorage.setItem("tetris_high", String(score));
        }
      } else {
        setCurrent({ ...next, pos: startPos });
      }
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === " ") {
      e.preventDefault();
      if (started && !gameOver) setPaused((p) => !p);
      return;
    }
    if (gameOver || paused || !started) return;
    if (e.key === "ArrowLeft") move(-1, 0);
    else if (e.key === "ArrowRight") move(1, 0);
    else if (e.key === "ArrowDown") move(0, 1);
    else if (e.key === "ArrowUp") {
      // Rotate
      const { shape, color, idx, pos } = current;
      const rotated = rotate(shape);
      if (!checkCollision(board, rotated, pos)) {
        setCurrent({ shape: rotated, color, idx, pos });
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [current, board, started, gameOver, paused]);

  function restart() {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    const { shape, color, idx } = randomShape();
    setCurrent({ shape, color, idx, pos: { x: 3, y: -2 } });
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setStarted(false);
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: 8,
          border: "1px solid #27272a",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          boxSizing: "border-box",
        }}
        className="pointer-events-auto"
      >
        <div
          className="flex items-center justify-between w-full px-4 py-1 border-b border-zinc-800 select-none bg-zinc-900/60"
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-100 font-medium">tetris</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
            tabIndex={0}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          className="pt-4 pb-8 px-4 flex flex-col items-center "
          style={{ flex: 1 }}
        >
          <div className="flex justify-center gap-8 items-center mb-2 w-full">
            <span className="text-green-600 text-base font-mono">
              Score: <span>{score}</span>
            </span>
            <span className="text-yellow-400 text-base font-mono">
              High: <span>{high}</span>
            </span>
          </div>
          <div
            className="relative mx-auto bg-zinc-950 border border-zinc-800"
            style={{
              width: COLS * BLOCK_SIZE,
              height: ROWS * BLOCK_SIZE,
              overflow: "hidden",
              position: "relative",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            {/* Board */}
            {board.map((row, y) =>
              row.map((cell, x) =>
                cell ? (
                  <div
                    key={x + "-" + y}
                    className="absolute"
                    style={{
                      left: x * BLOCK_SIZE,
                      top: y * BLOCK_SIZE,
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      background: COLORS[cell - 1],
                      borderRadius: 2,
                      zIndex: 2,
                      border: "1px solid #222",
                    }}
                  />
                ) : null
              )
            )}
            {/* Current piece */}
            {started &&
              current.shape.map((row, y) =>
                row.map((cell, x) =>
                  cell ? (
                    <div
                      key={x + "-" + y}
                      className="absolute"
                      style={{
                        left: (current.pos.x + x) * BLOCK_SIZE,
                        top: (current.pos.y + y) * BLOCK_SIZE,
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        background: current.color,
                        borderRadius: 2,
                        zIndex: 3,
                        border: "1px solid #222",
                      }}
                    />
                  ) : null
                )
              )}
            {!started && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-20">
                <span className="text-gray-100 font-bold text-xl mb-2">
                  TETRIS
                </span>
                <span className="text-gray-400 mb-1 text-center text-sm">
                  Arrow keys to move/rotate
                </span>
                <span className="text-gray-400 mb-1 text-center text-sm">
                  Space to pause/resume
                </span>
                <button
                  className="px-3 py-1 bg-zinc-800 text-gray-100 rounded font-medium text-sm hover:bg-zinc-700 transition"
                  onClick={() => setStarted(true)}
                >
                  Start Game
                </button>
              </div>
            )}
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-20">
                <span className="text-red-500 font-extrabold text-lg uppercase mb-2">
                  GAME OVER
                </span>
                <span className="text-gray-400 text-sm mb-3">
                  Score: {score}
                </span>
                {retryable && (
                  <button
                    className="px-3 py-1 bg-zinc-800 text-gray-100 rounded font-medium text-sm hover:bg-zinc-700 transition"
                    onClick={restart}
                  >
                    Restart
                  </button>
                )}
              </div>
            )}
            {paused && started && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-20">
                <span className="text-yellow-300 font-bold text-lg">
                  Paused
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
