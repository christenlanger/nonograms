import { useMemo } from "react";

import type { Cell, SolverBoard } from "@/shared/types";

import { solveBoard } from "./utils";

import Board from "../core/components/Board";

type Props = {
  config: SolverBoard;
};

export default function Solver({ config }: Props) {
  const { rows, cols, rowHints, colHints } = config;

  // Solve the board
  const solvingGrid = useMemo(() => solveBoard(config), [config]);

  // Convert marked tiles into proper indices
  const tiles = new Map<number, Cell>();
  let count = 0;
  let hasUnknown = false;
  for (let i = 0; i < solvingGrid.grid.length; i++) {
    for (let j = 0; j < solvingGrid.grid[i].length; j++) {
      if (solvingGrid.grid[i][j] !== "?") {
        tiles.set(count, solvingGrid.grid[i][j]);
      } else {
        hasUnknown = true;
      }
      count++;
    }
  }

  const boardLayout = {
    dimensions: { rows, cols },
    separators: { rows: 5, cols: 5 },
    tiles: tiles,
  };

  let status = "Board is solvable.";
  let statusCssClass = "board-solver-status";
  if (solvingGrid.status === "invalid") {
    status = "Board supplied was invalid.";
    statusCssClass += " invalid";
  } else if (hasUnknown) {
    status = "Board is not unique solvable.";
    statusCssClass += " not-unique";
  }

  return (
    <div className="board-solver">
      <Board boardLayout={boardLayout} hints={{ rowHints, colHints }} disableButtons={true} />
      <div className={statusCssClass}>
        <p>{status}</p>
      </div>
    </div>
  );
}
