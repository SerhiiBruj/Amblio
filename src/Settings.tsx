import { useState } from "react";

type EyeSettings = {
    hue: number;
    saturation: number;
    lightness: number;
};

export default function Settings() {
    const [isOpen, setIsOpen] = useState(false);

    const [selectedEye, setSelectedEye] = useState<"left" | "right">("left");

    const [leftEye, setLeftEye] = useState<EyeSettings>(() => {
        const saved = localStorage.getItem("visionSettings");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const l = parsed?.leftEye;

                if (l) {
                    return {
                        hue: l.hue ?? 0,
                        saturation: l.saturation ?? 100,
                        lightness: l.lightness ?? 50,
                    };
                }
            } catch (e) {
                console.error("Invalid localStorage data", e);
            }
        }

        return {
            hue: 0,
            saturation: 100,
            lightness: 50,
        };
    });

    const [rightEye, setRightEye] = useState<EyeSettings>(() => {
        const saved = localStorage.getItem("visionSettings");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const r = parsed?.rightEye;

                if (r) {
                    return {
                        hue: r.hue ?? 0,
                        saturation: r.saturation ?? 100,
                        lightness: r.lightness ?? 50,
                    };
                }
            } catch (e) {
                console.error("Invalid localStorage data", e);
            }
        }

        return {
            hue: 0,
            saturation: 100,
            lightness: 50,
        };
    });

    const currentEye =
        selectedEye === "left" ? leftEye : rightEye;

    const updateCurrentEye = (
        key: keyof EyeSettings,
        value: number
    ) => {
        if (selectedEye === "left") {
            setLeftEye((prev) => ({
                ...prev,
                [key]: value,
            }));
        } else {
            setRightEye((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
        setTimeout(() => {
            localStorage.setItem(
                "visionSettings",
                JSON.stringify({
                    leftEye,
                    rightEye,
                })
            );
        }, 15)
    };

    const sphereColor = `hsl(
        ${currentEye.hue},
        ${currentEye.saturation}%,
        ${currentEye.lightness}%
    )`;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="
                    fixed
                    top-4
                    right-4
                    bg-slate-700
                    hover:bg-slate-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    z-50
                "
            >
                Settings
            </button>

            {isOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        bg-black/80
                        flex
                        items-center
                        justify-center
                        z-[999]
                    "
                >
                    <div
                        className="
                            bg-slate-900
                            text-white
                            w-[650px]
                            max-w-[95vw]
                            rounded-2xl
                            p-6
                            shadow-2xl
                            relative
                        "
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="
                                absolute
                                right-4
                                top-4
                                text-xl
                                hover:text-red-400
                            "
                        >
                            ✕
                        </button>

                        <h2 className="text-3xl font-bold mb-6">
                            Vision Calibration
                        </h2>

                        {/* Eye selector */}
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() =>
                                    setSelectedEye("left")
                                }
                                className={`
                                    px-4 py-2 rounded-lg
                                    ${selectedEye === "left"
                                        ? "bg-blue-600"
                                        : "bg-slate-700"
                                    }
                                `}
                            >
                                Left Eye
                            </button>

                            <button
                                onClick={() =>
                                    setSelectedEye("right")
                                }
                                className={`
                                    px-4 py-2 rounded-lg
                                    ${selectedEye === "right"
                                        ? "bg-red-600"
                                        : "bg-slate-700"
                                    }
                                `}
                            >
                                Right Eye
                            </button>
                        </div>

                        <div
                            className="
                                flex
                                justify-center
                                items-center
                                rounded-xl
                                border
                                border-slate-700
                                h-[260px]
                                mb-6
                            "
                            style={{
                                backgroundColor: "gray",
                            }}
                        >
                            <div
                                className="
                                    w-40
                                    h-40
                                    rounded-full
                                "
                                style={{
                                    background: `
                                            ${sphereColor}
                                        
                                    `,
                                }}
                            />
                        </div>

                        {/* Hue */}
                        <div className="mb-5">
                            <div className="flex justify-between">
                                <span>Hue</span>
                                <span>{currentEye.hue}</span>
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={currentEye.hue}
                                onChange={(e) =>
                                    updateCurrentEye(
                                        "hue",
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="mb-5">
                            <div className="flex justify-between">
                                <span>Saturation</span>
                                <span>
                                    {currentEye.saturation}%
                                </span>
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={currentEye.saturation}
                                onChange={(e) =>
                                    updateCurrentEye(
                                        "saturation",
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="mb-5">
                            <div className="flex justify-between">
                                <span>Lightness</span>
                                <span>
                                    {currentEye.lightness}%
                                </span>
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={currentEye.lightness}
                                onChange={(e) =>
                                    updateCurrentEye(
                                        "lightness",
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="mt-6 text-sm text-slate-400">
                            <div>
                                Left Eye:
                                {" "}
                                hsl(
                                {leftEye.hue},
                                {" "}
                                {leftEye.saturation}%,
                                {" "}
                                {leftEye.lightness}%)
                            </div>

                            <div>
                                Right Eye:
                                {" "}
                                hsl(
                                {rightEye.hue},
                                {" "}
                                {rightEye.saturation}%,
                                {" "}
                                {rightEye.lightness}%)
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}