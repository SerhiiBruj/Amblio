import  { useEffect, useRef, useState } from "react";

/* =========================
   TYPES
========================= */

type EyeSettings = {
    hue: number;
    saturation: number;
    lightness: number;
};

type Piece = {
    x: number;
    y: number;
    matrix: number[][];
};

/* =========================
   CONFIG
========================= */

const CONFIG = {
    W: 15,
    H: 20,
    BLOCK_SIZE: 32,
};

/* =========================
   PIECES
========================= */

const PIECES = [
    [
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
];

/* =========================
   HELPERS
========================= */

const eyeToColor = (eye: EyeSettings) =>
    `hsl(${eye.hue}, ${eye.saturation}%, ${eye.lightness}%)`;

const rotateMatrix = (m: number[][]) =>
    m[0].map((_, i) => m.map((r) => r[i]).reverse());

const getRandomPiece = (): Piece => ({
    x: Math.floor(CONFIG.W / 2) - 2,
    y: 0,
    matrix:
        PIECES[Math.floor(Math.random() * PIECES.length)],
});

/* =========================
   COLLISION
========================= */

const collide = (board: number[][], piece: Piece) => {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (!piece.matrix[y][x]) continue;

            const bx = piece.x + x;
            const by = piece.y + y;

            if (
                bx < 0 ||
                bx >= CONFIG.W ||
                by >= CONFIG.H ||
                (board[by] && board[by][bx])
            ) {
                return true;
            }
        }
    }
    return false;
};

/* =========================
   MAIN
========================= */

export default function Tetris() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [gameOver, setGameOver] = useState(false);

    const [leftEye, setLeft] = useState<EyeSettings>(() => {
        try {
            const s = localStorage.getItem("visionSettings");
            return s ? JSON.parse(s).leftEye : { hue: 0, saturation: 100, lightness: 50 };
        } catch {
            return { hue: 0, saturation: 100, lightness: 50 };
        }
    });

    const [rightEye, setRight] = useState<EyeSettings>(() => {
        try {
            const s = localStorage.getItem("visionSettings");
            return s ? JSON.parse(s).rightEye : { hue: 200, saturation: 100, lightness: 50 };
        } catch {
            return { hue: 200, saturation: 100, lightness: 50 };
        }
    });

    const boardRef = useRef<number[][]>(
        Array.from({ length: CONFIG.H }, () =>
            Array(CONFIG.W).fill(0)
        )
    );

    const pieceRef = useRef<Piece>(getRandomPiece());

    /* =========================
       CLEAR LINES
    ========================= */

    const clearLines = (board: number[][]) => {
        const filtered = board.filter(row =>
            row.some(cell => cell === 0)
        );

        const empty = Array.from(
            { length: CONFIG.H - filtered.length },
            () => Array(CONFIG.W).fill(0)
        );

        return [...empty, ...filtered];
    };

    const resetGame = () => {
        boardRef.current = Array.from(
            { length: CONFIG.H },
            () => Array(CONFIG.W).fill(0)
        );
        pieceRef.current = getRandomPiece();
        setGameOver(false);
    };

    /* =========================
       INPUT
    ========================= */

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameOver) {
                if (e.key.toLowerCase() === "r") resetGame();
                return;
            }

            const p = pieceRef.current;
            let next = { ...p };

            if (
                e.key === "ArrowLeft" ||
                e.key === "a"
            ) next.x--;

            if (
                e.key === "ArrowRight" ||
                e.key === "d"
            ) next.x++;

            if (
                e.key === "ArrowDown" ||
                e.key === "s"
            ) next.y++;

            if (
                e.key === "ArrowUp" ||
                e.key === "w"
            ) {
                next.matrix = rotateMatrix(next.matrix);
            }

            if (!collide(boardRef.current, next)) {
                pieceRef.current = next;
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameOver]);

    /* =========================
       GRAVITY
    ========================= */

    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            const p = pieceRef.current;

            const next = { ...p, y: p.y + 1 };

            if (!collide(boardRef.current, next)) {
                pieceRef.current = next;
            } else {
                const b = boardRef.current;

                p.matrix.forEach((row, y) => {
                    row.forEach((val, x) => {
                        if (val) {
                            const py = p.y + y;
                            const px = p.x + x;

                            if (py < 0) {
                                setGameOver(true);
                                return;
                            }

                            if (b[py]) b[py][px] = 1;
                        }
                    });
                });

                boardRef.current = clearLines(boardRef.current);

                pieceRef.current = getRandomPiece();

                if (collide(boardRef.current, pieceRef.current)) {
                    setGameOver(true);
                }
            }
        }, 400);

        return () => clearInterval(interval);
    }, [gameOver]);

    /* =========================
       RENDER
    ========================= */

    useEffect(() => {
        let frame: number;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#808080";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // board
            ctx.fillStyle = eyeToColor(leftEye);

            boardRef.current.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        ctx.fillRect(
                            x * CONFIG.BLOCK_SIZE,
                            y * CONFIG.BLOCK_SIZE,
                            CONFIG.BLOCK_SIZE,
                            CONFIG.BLOCK_SIZE
                        );
                    }
                });
            });

            // piece
            ctx.fillStyle = eyeToColor(rightEye);

            const p = pieceRef.current;

            p.matrix.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        ctx.fillRect(
                            (p.x + x) * CONFIG.BLOCK_SIZE,
                            (p.y + y) * CONFIG.BLOCK_SIZE,
                            CONFIG.BLOCK_SIZE,
                            CONFIG.BLOCK_SIZE
                        );
                    }
                });
            });

            if (gameOver) {
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
                ctx.fillText("Press R", canvas.width / 2, canvas.height / 2 + 40);
            }

            frame = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(frame);
    }, [leftEye, rightEye, gameOver]);

    return (
        <div>
            <div className="absolute bg-gray-500 p-1 rounded-xl opacity-90"
                onClick={(_) => {
                    let l = leftEye
                    let r = rightEye
                    setLeft(r)
                    setRight(l)
                }}

            >
                <i>
                    vise-versa
                </i>
            </div>
            <div className="absolute bg-gray-500 p-1 rounded-xl opacity-90 left-[80vw]"
                onClick={(_) => {
                    resetGame()
                }}

            >
                <i>
                    restart
                </i>
            </div>
            <canvas
                ref={canvasRef}
                width={CONFIG.W * CONFIG.BLOCK_SIZE}
                height={CONFIG.H * CONFIG.BLOCK_SIZE}
            />
        </div>
    );
}