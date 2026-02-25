export type Cell = "O" | "X" | "?";

export type BoardLayout = {
  dimensions: {
    rows: number;
    cols: number;
  };
  separators?: {
    rows?: number;
    cols?: number;
  };
  tiles: Map<number, Cell>;
};

export type DragMode = "mark" | "unmark" | "unset";

export type Hints = {
  rowHints: number[][];
  colHints: number[][];
};

export type SolverBoard = {
  rows: number;
  cols: number;
  grid: Cell[][];
} & Hints;
