import { useState } from "react";

import type { SolverBoard } from "./shared/types";

import Composer from "./features/composer/components/Composer";
import Solver from "./features/solver/Solver";
import InteractiveBoard from "./features/core/components/InteractiveBoard";

const dummyBoard: BoardLayout = {
  dimensions: {
    rows: 10,
    cols: 10,
  },
  separators: {
    rows: 5,
    cols: 5,
  },
  tiles: new Map(),
};

export default function App() {
  const [solverBoard, setBoardLayout] = useState<SolverBoard | null>(null);

  const handleOnSave = (solverBoard: SolverBoard) => {
    setBoardLayout(solverBoard);
  };

  return (
    <>
      <InteractiveBoard boardLayout={dummyBoard} />
    </>
  );
}
