import  { useEffect, useRef, useState } from "react";

type EyeSettings = {
    hue: number;
    saturation: number;
    lightness: number;
};

type Dot = {
    x: number;
    y: number;
    r: number;
};

const CONFIG = {
    W: 900,
    H: 600,
};

const eyeToColor = (eye: EyeSettings) =>
    `hsl(${eye.hue}, ${eye.saturation}%, ${eye.lightness}%)`;

const randomDot = (): Dot => ({
    x: Math.random() * CONFIG.W,
    y: Math.random() * CONFIG.H,
    r: 6 + Math.random() * 6,
});

export default function DotsGame() {
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

    const playerRef = useRef({
        x: CONFIG.W / 2,
        y: CONFIG.H / 2,
    });

    const mouseRef = useRef({
        x: CONFIG.W / 2,
        y: CONFIG.H / 2,
    });

    const dotRef = useRef<Dot>(randomDot());

    const scoreRef = useRef(0);

    const speedRef = useRef(0.15); // поступове прискорення

    const resetGame = () => {
        scoreRef.current = 0;
        speedRef.current = 0.15;
        dotRef.current = randomDot();
    };

    useEffect(() => {
        const move = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    useEffect(() => {
        let frame: number;

        const update = () => {
            const player = playerRef.current;
            const mouse = mouseRef.current;
            const dot = dotRef.current;

            player.x += (mouse.x - player.x) *0.2;
            player.y += (mouse.y - player.y) *0.2;


            // collision
            const dx = player.x - dot.x;
            const dy = player.y - dot.y;

            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < dot.r + 10) {
                scoreRef.current++;

                speedRef.current += 0.01; // складніше з часом

                dotRef.current = randomDot();
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

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // background
            ctx.fillStyle = "#808080";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const dot = dotRef.current;
            const player = playerRef.current;

            // dot
            ctx.fillStyle = eyeToColor(rightEye);
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fill();

            // player
            ctx.fillStyle = eyeToColor(leftEye);
            ctx.beginPath();
            ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
            ctx.fill();

            // score
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);

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
                swap colors
            </div>

            <div
                className="absolute bg-gray-500 p-1 rounded-xl opacity-90 left-[80vw] cursor-pointer"
                onClick={resetGame}
            >
                restart
            </div>

            <canvas
                style={{ cursor: "none" }}
                ref={canvasRef}
                width={CONFIG.W}
                height={CONFIG.H}
            />
        </div>
    );
}