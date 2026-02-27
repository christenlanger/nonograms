import type { BoardLayout, Cell, Hints } from "./types";

export const dummyBoard: BoardLayout = {
  dimensions: {
    rows: 15,
    cols: 15,
  },
  separators: {
    rows: 5,
    cols: 5,
  },
  tiles: new Map(),
};

export const initialHints: Hints = {
  rowHints: Array.from({ length: dummyBoard.dimensions.rows }, () => [0]),
  colHints: Array.from({ length: dummyBoard.dimensions.cols }, () => [0]),
};

// Helper function to compare two lines
export function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Helper function to substitute for slice+indexOf
export const checkForMark = (
  cells: Cell[],
  mark: Cell,
  lastMode: boolean = false,
  ...blocks: number[]
): number => {
  const [blockStart = 0, blockEnd = cells.length - 1] = blocks;

  let foundMark = -1;

  for (let i = blockStart; i <= blockEnd; i++) {
    if (cells[i] === mark) {
      foundMark = i - blockStart;

      // Return first instance if not on lastMode
      if (!lastMode) break;
    }
  }

  return foundMark;
};
