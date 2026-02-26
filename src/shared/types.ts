// Board layout types

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

// Interactive board types

export type DragMode = "mark" | "unmark" | "unset";

export type ClickMode = "left" | "right";

// Solver board types

export type Hints = {
  rowHints: number[][];
  colHints: number[][];
};

export type SolverBoard = {
  rows: number;
  cols: number;
  grid?: Cell[][];
} & Hints;

// Board storage

export type BoardData = {
  id: string;
  rows: number;
  cols: number;
  solution: number[];
} & Hints;
