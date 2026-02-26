import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import type { SolverBoard } from "./shared/types";

import Composer from "./features/composer/components/Composer";
import Solver from "./features/solver/Solver";
import Game from "./features/game/Game";

export default function App() {
  const [solverBoard, setBoardLayout] = useState<SolverBoard | null>(null);

  const handleOnSave = (solverBoard: SolverBoard) => {
    setBoardLayout(solverBoard);
  };

  const composerTest = (
    <>
      <Composer onSave={handleOnSave} />
      {solverBoard && <Solver config={solverBoard} />}
    </>
  );

  const gameTest = (
    <>{solverBoard ? <Game solverBoard={solverBoard} /> : <p>No config loaded.</p>}</>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={gameTest} />
        <Route path="/composer" element={composerTest} />
      </Routes>
    </BrowserRouter>
  );
}
