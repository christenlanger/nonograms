import { useState } from "react";

import type { SolverBoard } from "@/shared/types";

import NonogramComposer from "@/features/composer/components/NonogramComposer";
import Solver from "@/features/solver/Solver";

export default function Composer() {
  const [solverBoard, setBoardLayout] = useState<SolverBoard | null>(null);

  const handleOnSave = (solverBoard: SolverBoard) => {
    setBoardLayout(solverBoard);
  };

  return (
    <>
      <NonogramComposer onSave={handleOnSave} />
      {solverBoard && <Solver config={solverBoard} />}
    </>
  );
}
