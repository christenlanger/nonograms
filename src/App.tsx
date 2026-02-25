import { useState } from "react";

import type { SolverBoard } from "./features/solver/types";

import Composer from "./features/composer/components/Composer";
import Solver from "./features/solver/Solver";

export default function App() {
  const [solverBoard, setBoardLayout] = useState<SolverBoard | null>(null);

  const handleOnSave = (solverBoard: SolverBoard) => {
    setBoardLayout(solverBoard);
  };

  return (
    <>
      <Composer onSave={handleOnSave} />
      {solverBoard && <Solver config={solverBoard} />}
    </>
  );
}
