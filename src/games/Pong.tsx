import  { useEffect, useRef, useState } from "react";

type EyeSettings = {
    hue: number;
    saturation: number;
    lightness: number;
};

type Paddle = {
    y: number;
};

type Ball = {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

const CONFIG = {
    W: 900,
    H: 600,

    PADDLE_W: 20,
    PADDLE_H: 120,

    BALL_SIZE: 20,

    PADDLE_SPEED: 8,
};

const eyeToColor = (eye: EyeSettings) =>
    `hsl(${eye.hue}, ${eye.saturation}%, ${eye.lightness}%)`;

export default function Pong() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const aiTargetRef = useRef(CONFIG.H / 2);

    useEffect(() => {
        const interval = setInterval(() => {
            if (ballRef.current.vx > 0) {
                aiTargetRef.current =
                    ballRef.current.y +
                    CONFIG.BALL_SIZE / 2 +
                    (Math.random() - 0.5) * 70;
            }
        }, 120);

        return () => clearInterval(interval);
    }, []);
    const leftPaddleRef = useRef<Paddle>({
        y: CONFIG.H / 2 - CONFIG.PADDLE_H / 2,
    });

    const rightPaddleRef = useRef<Paddle>({
        y: CONFIG.H / 2 - CONFIG.PADDLE_H / 2,
    });

    const ballRef = useRef<Ball>({
        x: CONFIG.W / 2,
        y: CONFIG.H / 2,
        vx: 5,
        vy: 3,
    });

    const scoreRef = useRef({
        left: 0,
        right: 0,
    });

    const keysRef = useRef({
        w: false,
        s: false,
        up: false,
        down: false,
    });

    const resetBall = (dir: number) => {
        ballRef.current = {
            x: CONFIG.W / 2,
            y: CONFIG.H / 2,
            vx: dir * 5,
            vy: (Math.random() - 0.5) * 6,
        };
    };

    const resetGame = () => {
        scoreRef.current = {
            left: 0,
            right: 0,
        };

        leftPaddleRef.current.y =
            CONFIG.H / 2 - CONFIG.PADDLE_H / 2;

        rightPaddleRef.current.y =
            CONFIG.H / 2 - CONFIG.PADDLE_H / 2;

        resetBall(Math.random() > 0.5 ? 1 : -1);
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            switch (e.key) {
                case "w":
                case "W":
                    keysRef.current.w = true;
                    break;

                case "s":
                case "S":
                    keysRef.current.s = true;
                    break;

                case "ArrowUp":
                    keysRef.current.up = true;
                    break;

                case "ArrowDown":
                    keysRef.current.down = true;
                    break;
            }
        };

        const up = (e: KeyboardEvent) => {
            switch (e.key) {
                case "w":
                case "W":
                    keysRef.current.w = false;
                    break;

                case "s":
                case "S":
                    keysRef.current.s = false;
                    break;

                case "ArrowUp":
                    keysRef.current.up = false;
                    break;

                case "ArrowDown":
                    keysRef.current.down = false;
                    break;
            }
        };

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    useEffect(() => {
        let frame: number;

        const update = () => {
            const left = leftPaddleRef.current;
            const right = rightPaddleRef.current;
            const ball = ballRef.current;

            // Left paddle

            if (keysRef.current.w)
                left.y -= CONFIG.PADDLE_SPEED;

            if (keysRef.current.s)
                left.y += CONFIG.PADDLE_SPEED;
            // Right paddle AI
            const paddleCenter =
                right.y + CONFIG.PADDLE_H / 2;

            const aiSpeed = 5;

            if (paddleCenter < aiTargetRef.current - 10)
                right.y += aiSpeed;

            if (paddleCenter > aiTargetRef.current + 10)
                right.y -= aiSpeed;

            left.y = Math.max(
                0,
                Math.min(CONFIG.H - CONFIG.PADDLE_H, left.y)
            );

            right.y = Math.max(
                0,
                Math.min(CONFIG.H - CONFIG.PADDLE_H, right.y)
            );

            // Ball movement

            ball.x += ball.vx;
            ball.y += ball.vy;

            // Top / Bottom collision

            if (
                ball.y <= 0 ||
                ball.y >= CONFIG.H - CONFIG.BALL_SIZE
            ) {
                ball.vy *= -1;
            }

            // Left paddle collision

            if (
                ball.x <= 40 &&
                ball.y + CONFIG.BALL_SIZE >= left.y &&
                ball.y <= left.y + CONFIG.PADDLE_H
            ) {
                ball.vx = Math.abs(ball.vx) * 1.1;

                const hit =
                    (ball.y +
                        CONFIG.BALL_SIZE / 2 -
                        (left.y + CONFIG.PADDLE_H / 2)) /
                    (CONFIG.PADDLE_H / 2);

                ball.vy += hit * 2;
            }

            // Right paddle collision

            if (
                ball.x + CONFIG.BALL_SIZE >=
                CONFIG.W - 40 &&
                ball.y + CONFIG.BALL_SIZE >= right.y &&
                ball.y <= right.y + CONFIG.PADDLE_H
            ) {
                ball.vx = -Math.abs(ball.vx) * 1.1;

                const hit =
                    (ball.y +
                        CONFIG.BALL_SIZE / 2 -
                        (right.y + CONFIG.PADDLE_H / 2)) /
                    (CONFIG.PADDLE_H / 2);

                ball.vy += hit * 2;
            }

            // Left missed

            if (ball.x < -CONFIG.BALL_SIZE) {
                scoreRef.current.right++;
                resetBall(1);
            }

            // Right missed

            if (ball.x > CONFIG.W + CONFIG.BALL_SIZE) {
                scoreRef.current.left++;
                resetBall(-1);
            }

            frame = requestAnimationFrame(update);
        };

        update();

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        let frame: number;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Background

            ctx.fillStyle = "#808080";
            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Center line

            ctx.fillStyle = "#999";

            for (let y = 0; y < CONFIG.H; y += 40) {
                ctx.fillRect(
                    CONFIG.W / 2 - 3,
                    y,
                    6,
                    20
                );
            }

            // Left paddle

            ctx.fillStyle = eyeToColor(leftEye);

            ctx.fillRect(
                20,
                leftPaddleRef.current.y,
                CONFIG.PADDLE_W,
                CONFIG.PADDLE_H
            );

            // Right paddle

            ctx.fillStyle = eyeToColor(rightEye);

            ctx.fillRect(
                CONFIG.W - 40,
                rightPaddleRef.current.y,
                CONFIG.PADDLE_W,
                CONFIG.PADDLE_H
            );

            // Ball

            ctx.fillStyle = eyeToColor(rightEye);

            ctx.fillRect(
                ballRef.current.x,
                ballRef.current.y,
                CONFIG.BALL_SIZE,
                CONFIG.BALL_SIZE
            );

            // Score

            ctx.font = "50px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";

            ctx.fillText(
                `${scoreRef.current.left}`,
                CONFIG.W / 2 - 60,
                60
            );

            ctx.fillText(
                `${scoreRef.current.right}`,
                CONFIG.W / 2 + 60,
                60
            );

            frame = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(frame);
    }, [leftEye, rightEye]);

    return (
        <div>
            <div
                className="absolute bg-gray-500 p-1 rounded-xl opacity-90 cursor-pointer"
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
                className="absolute bg-gray-500 p-1 rounded-xl opacity-90 left-[80vw] cursor-pointer"
                onClick={resetGame}
            >
                <i>restart</i>
            </div>

            <canvas
                ref={canvasRef}
                width={CONFIG.W}
                height={CONFIG.H}
            />
        </div>
    );
}