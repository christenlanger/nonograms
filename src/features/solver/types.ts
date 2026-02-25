export type Cell = "O" | "X" | "?";

export type LineConfig = {
  status: "valid" | "invalid";
  cells: Cell[];
};

export type Hints = {
  rowHints: number[][];
  colHints: number[][];
};

export type SolverBoard = {
  rows: number;
  cols: number;
  grid: Cell[][];
} & Hints;
