import Solver from "@/features/solver/Solver";
import type { SolverBoard } from "@/shared/types";

export default function SolverPage() {
  const solverBoard: SolverBoard = {
    rows: 15,
    cols: 15,
    rowHints: [
      [3, 3],
      [1, 3, 1],
      [9],
      [2, 2],
      [3, 3],
      [9],
      [9],
      [7],
      [9],
      [3, 2],
      [12],
      [3, 2, 2, 2],
      [2, 2, 3, 2],
      [2, 2, 2, 2],
      [2, 2, 2, 2],
    ],
    colHints: [
      [4],
      [5, 6],
      [12],
      [1, 1, 7],
      [3, 4, 5],
      [2, 4, 5],
      [3, 4, 1],
      [1, 1, 5, 3],
      [9, 5],
      [5, 1, 1, 3],
      [3],
      [3],
      [5],
      [3],
      [0],
    ],
  };

  return <Solver config={solverBoard} />;
}
