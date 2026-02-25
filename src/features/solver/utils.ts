import type { Cell, LineConfig } from "./types";

// Helper function to substitute for slice+indexOf
const checkForMark = (
  cells: Cell[],
  mark: Cell,
  lastMode: boolean = false,
  ...blocks: number[]
): number => {
  const [blockStart = 0, blockEnd = cells.length] = blocks;

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

// Check possible spaces for current line configuration. We can also mark edges with X this way.
export function getOverlaps(currentCell: Cell[], hint: number[]): LineConfig {
  const length = currentCell.length;
  const result: LineConfig = {
    status: "valid",
    cells: [...currentCell],
  };

  if (!hint.length) return result;
  const n = hint.length;

  // Fine the earliest and latest start indexes
  const earliestIdx: number[] = new Array(n).fill(0);
  earliestIdx[0] = 0;
  for (let i = 1; i < n; i++) {
    earliestIdx[i] = earliestIdx[i - 1] + hint[i - 1] + 1;
  }

  const latestIdx: number[] = new Array(n).fill(0);
  latestIdx[n - 1] = length - hint[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    latestIdx[i] = latestIdx[i + 1] - hint[i] - 1;
  }

  // Helper function to modify array with sliding indexes.
  const slideIndexes = (
    idx: number[],
    amount: number,
    startIndex: number = 0,
    isReverse: boolean = false,
  ) => {
    for (let i = startIndex; isReverse ? i >= 0 : i < idx.length; isReverse ? i-- : i++) {
      idx[i] += amount;
    }
  };

  let invalid = false;

  // Check if current O marks do not exceed hints
  const totalOMarks = currentCell.reduce((sum, val) => (val === "O" ? sum + 1 : sum), 0);
  const totalHints = hint.reduce((sum, val) => sum + val, 0);

  // Invalid if total marks exceed hints
  if (totalOMarks > totalHints) invalid = true;

  // Invalid if hint configuration would exceed the length of the line
  if (totalHints + n - 1 > length) invalid = true;

  // Slide to the right based on constraints
  for (let i = 0; !invalid && i < earliestIdx.length; i++) {
    const blockStart = earliestIdx[i];
    const blockEnd = earliestIdx[i] + hint[i] - 1;

    let lastX = checkForMark(currentCell, "X", true, blockStart, blockEnd);
    let slideAmt = 0;

    // Slide until current hint fits the constraint
    while (
      blockEnd + slideAmt < length &&
      (lastX >= 0 || currentCell[blockEnd + slideAmt + 1] === "O")
    ) {
      if (lastX !== -1) {
        slideAmt += lastX + 1;
        lastX = checkForMark(currentCell, "X", true, blockStart + slideAmt, blockEnd + slideAmt);
      } else {
        slideAmt++;
      }
    }

    if (blockEnd + slideAmt >= length) {
      invalid = true;
      break;
    }

    if (slideAmt > 0) {
      slideIndexes(earliestIdx, slideAmt, i);
    }
  }

  // Slide to the left based on constraints
  for (let i = latestIdx.length - 1; !invalid && i >= 0; i--) {
    const blockStart = latestIdx[i];
    const blockEnd = latestIdx[i] + hint[i] - 1;

    let firstX = checkForMark(currentCell, "X", false, blockStart, blockEnd);
    let slideAmt = 0;

    // Slide until current hint fits the constraint
    while (
      blockStart - slideAmt >= 0 &&
      (firstX >= 0 || currentCell[blockStart - slideAmt - 1] === "O")
    ) {
      if (firstX !== -1) {
        slideAmt += hint[i] - firstX;
        firstX = checkForMark(currentCell, "X", false, blockStart - slideAmt, blockEnd - slideAmt);
      } else {
        slideAmt++;
      }
    }

    if (blockEnd - slideAmt < 0) {
      invalid = true;
      break;
    }

    if (slideAmt > 0) {
      slideIndexes(latestIdx, -slideAmt, i, true);
    }
  }

  // Iterate for each existing O in the block and check applicable hints
  for (let i = 0; !invalid && i < currentCell.length; i++) {
    if (currentCell[i] === "O") {
      const possibleBlocks = [];
      for (let j = 0; j < n; j++) {
        const start = earliestIdx[j];
        const end = latestIdx[j] + hint[j] - 1;
        if (start <= i && end >= i) possibleBlocks.push(j);
      }

      if (possibleBlocks.length === 0) {
        invalid = true;
        break;
      }

      if (possibleBlocks.length === 1) {
        const j = possibleBlocks[0];
        earliestIdx[j] = Math.max(earliestIdx[j], i - hint[j] + 1);
        latestIdx[j] = Math.min(latestIdx[j], i);
      }
    }
  }

  // Invalid state reached. Hints does not satisfy passed currentCell value.
  if (invalid) {
    result.status = "invalid";
    return result;
  }

  // Calculate overlaps
  for (let i = 0; i < earliestIdx.length; i++) {
    const left = earliestIdx[i];
    const right = latestIdx[i];
    const overlapEnd = left + hint[i];

    if (overlapEnd >= right) {
      for (let j = right; j < overlapEnd; j++) {
        result.cells[j] = "O";
      }
    }

    // Mark edges of this hint as X if earliest and latest are equal.
    if (left === right) {
      if (left - 1 >= 0) result.cells[left - 1] = "X";
      if (overlapEnd + 1 < length) result.cells[overlapEnd + 1] = "X";
    }
  }

  // Mark edges as X
  if (earliestIdx[0] > 0) {
    for (let i = 0; i < earliestIdx[0]; i++) {
      result.cells[i] = "X";
    }
  }

  const endBoundary = latestIdx[n - 1] + hint[n - 1] - 1;
  if (endBoundary < length) {
    for (let i = length - 1; i > endBoundary; i--) {
      result.cells[i] = "X";
    }
  }

  // Mark gaps between hints as X if the ranges do not intersect.
  for (let i = 0; i < n - 1; i++) {
    const currentEnd = latestIdx[i] + hint[i] - 1;
    const nextStart = earliestIdx[i + 1];
    if (currentEnd < nextStart - 1) {
      for (let j = currentEnd + 1; j <= nextStart - 1; j++) {
        result.cells[j] = "X";
      }
    }
  }

  return result;
}
