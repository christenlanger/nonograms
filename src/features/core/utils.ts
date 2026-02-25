import type { Cell } from "../solver/types";

export function generateCells(rows: number, cols: number, tiles: Set<number>): Cell[][] {
  const output: Cell[][] = [];
  let count = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (tiles.has(count)) output[i][j] = "O";
      count++;
    }
  }

  return output;
}
