import { useEffect, useRef, useState } from "react";

type EyeSettings = {
    hue: number;
    saturation: number;
    lightness: number;
};

type Cell = {
    x: number;
    y: number;
};

const CONFIG = {
    W: 20,
    H: 20,
    BLOCK_SIZE: 32,
};

const eyeToColor = (eye: EyeSettings) =>
    `hsl(${eye.hue}, ${eye.saturation}%, ${eye.lightness}%)`;

const randomFood = (): Cell => ({
    x: Math.floor(Math.random() * CONFIG.W),
    y: Math.floor(Math.random() * CONFIG.H),
});

export default function Snake() {
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


    const snakeRef = useRef<Cell[]>([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ]);

    const foodRef = useRef<Cell>(randomFood());

    const directionRef = useRef({
        x: 1,
        y: 0,
    });

    const resetGame = () => {
        snakeRef.current = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 },
        ];

        directionRef.current = {
            x: 1,
            y: 0,
        };

        foodRef.current = randomFood();
        setGameOver(false);
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameOver) {
                if (e.key.toLowerCase() === "r") {
                    resetGame();
                }
                return;
            }

            const dir = directionRef.current;

            switch (e.key) {
                case "ArrowUp":
                case "w":
                    if (dir.y !== 1)
                        directionRef.current = { x: 0, y: -1 };
                    break;

                case "ArrowDown":
                case "s":
                    if (dir.y !== -1)
                        directionRef.current = { x: 0, y: 1 };
                    break;

                case "ArrowLeft":
                case "a":
                    if (dir.x !== 1)
                        directionRef.current = { x: -1, y: 0 };
                    break;

                case "ArrowRight":
                case "d":
                    if (dir.x !== -1)
                        directionRef.current = { x: 1, y: 0 };
                    break;
            }
        };

        window.addEventListener("keydown", handleKey);

        return () =>
            window.removeEventListener("keydown", handleKey);
    }, [gameOver]);

    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            const snake = [...snakeRef.current];

            const head = snake[0];

            const nextHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y,
            };

            // wall collision
            if (
                nextHead.x < 0 ||
                nextHead.x >= CONFIG.W ||
                nextHead.y < 0 ||
                nextHead.y >= CONFIG.H
            ) {
                setGameOver(true);
                return;
            }

            // self collision
            if (
                snake.some(
                    s =>
                        s.x === nextHead.x &&
                        s.y === nextHead.y
                )
            ) {
                setGameOver(true);
                return;
            }

            snake.unshift(nextHead);

            const food = foodRef.current;

            if (
                nextHead.x === food.x &&
                nextHead.y === food.y
            ) {
                let newFood: Cell;

                do {
                    newFood = randomFood();
                } while (
                    snake.some(
                        s =>
                            s.x === newFood.x &&
                            s.y === newFood.y
                    )
                );

                foodRef.current = newFood;
            } else {
                snake.pop();
            }

            snakeRef.current = snake;
        }, 150);

        return () => clearInterval(interval);
    }, [gameOver]);

    useEffect(() => {
        let frame: number;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#808080";
            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            // snake
            ctx.fillStyle = eyeToColor(leftEye);

            snakeRef.current.forEach(part => {
                ctx.fillRect(
                    part.x * CONFIG.BLOCK_SIZE,
                    part.y * CONFIG.BLOCK_SIZE,
                    CONFIG.BLOCK_SIZE,
                    CONFIG.BLOCK_SIZE
                );
            });

            // food
            ctx.fillStyle = eyeToColor(rightEye);

            ctx.fillRect(
                foodRef.current.x * CONFIG.BLOCK_SIZE,
                foodRef.current.y * CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE
            );

            if (gameOver) {
                ctx.fillStyle =
                    "rgba(0,0,0,0.7)";

                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.textAlign = "center";

                ctx.fillText(
                    "GAME OVER",
                    canvas.width / 2,
                    canvas.height / 2
                );

                ctx.fillText(
                    "Press R",
                    canvas.width / 2,
                    canvas.height / 2 + 40
                );
            }

            frame = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(frame);
    }, [leftEye, rightEye, gameOver]);

    return (
        <div>
            <div
                className="absolute bg-gray-500 p-1 rounded-xl opacity-90"
                onClick={() => {
                    const l = leftEye;
                    const r = rightEye;

                    setLeft(r);
                    setRight(l);
                }}
            >
                <i>vise-versa</i>
            </div>

            <div
                className="absolute bg-gray-500 p-1 rounded-xl opacity-90 left-[80vw]"
                onClick={resetGame}
            >
                <i>restart</i>
            </div>

            <canvas
                ref={canvasRef}
                width={CONFIG.W * CONFIG.BLOCK_SIZE}
                height={CONFIG.H * CONFIG.BLOCK_SIZE}
            />
        </div>
    );
}