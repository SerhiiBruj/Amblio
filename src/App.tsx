import { useState } from "react";
import Tetris from "./games/Tetris";
import Settings from "./Settings";
import "./App.css"
import Snake from "./games/Snake";
import Pong from "./games/Pong";
import DotsGame from "./games/Dots";

const Mode = {
  Tetris: 0,
  Snake: 1,
  Pong: 2,
  Dots: 3,
} as const;

type Mode = typeof Mode[keyof typeof Mode];
type ChooseModeProps = {
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
};
function ChooseMode({ setMode }: ChooseModeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
        
          absolute
          top-4
          left-4
          bg-slate-700
          hover:bg-slate-600
          text-white
          px-4
          py-2
          rounded-lg
          z-50
        "
      >
        Mode
      </button>

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
          "
        >
          <div onClick={() => setIsOpen(false)} className="bg-white p-4 rounded-lg flex flex-col gap-2 hoveran">
            <button onClick={() => setMode(Mode.Tetris)}>Tetris</button>
            <button onClick={() => setMode(Mode.Snake)}>Snake</button>
            <button onClick={() => setMode(Mode.Pong)}>Pong</button>
            <button onClick={() => setMode(Mode.Dots)}>Dots</button>
          </div>
        </div>
      )}
    </>
  );
}









function App() {
  const [mode, setMode] = useState<Mode>(Mode.Tetris);

  return (
    <div className="flex items-center justify-center h-screen">
      <ChooseMode setMode={setMode} />
      <Settings />

      {mode === Mode.Tetris && <Tetris />}
      {mode === Mode.Snake && <Snake />}
      {mode === Mode.Pong && <Pong />}
      {mode === Mode.Dots && <DotsGame />}
    </div>
  );
}

export default App;