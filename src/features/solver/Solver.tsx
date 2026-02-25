import { useMemo } from "react";

import type { Cell, SolverBoard } from "@/shared/types";

import { solveBoard } from "./utils";

import Board from "../core/components/Board";
import HintsList from "../core/components/Hints";

type Props = {
  config: SolverBoard;
};

export default function Solver({ config }: Props) {
  const { rows, cols, rowHints, colHints } = config;

  // Solve the board
  const solvingGrid = useMemo(() => solveBoard(config), [config]);

  if (solvingGrid.status === "invalid") {
    return <div>Board configuration was invalid.</div>;
  }

  // Convert marked tiles into proper indices
  const tiles = new Map<number, Cell>();
  let count = 0;
  for (let i = 0; i < solvingGrid.grid.length; i++) {
    for (let j = 0; j < solvingGrid.grid[i].length; j++) {
      if (solvingGrid.grid[i][j] !== "?") {
        tiles.set(count, solvingGrid.grid[i][j]);
      }
      count++;
    }
  }

  const boardLayout = {
    dimensions: { rows, cols },
    separators: { rows: 5, cols: 5 },
    tiles: tiles,
  };

  return (
    <div className="board-container">
      <div className="placeholder"></div>
      <HintsList hints={colHints} mode="cols" />
      <HintsList hints={rowHints} mode="rows" />
      <Board boardLayout={boardLayout} />
    </div>
  );
}
