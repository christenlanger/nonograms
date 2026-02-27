import type { Cell, SolverBoard } from "@/shared/types";
import type { HintInfo, LineConfig, SolvedBoard } from "./types";

import { arraysEqual, checkForMark } from "@/shared/utils";

// Check possible spaces for current line configuration. We can also mark edges with X this way.
export function getOverlaps(currentCell: Cell[], hints: number[]): LineConfig {
  const length = currentCell.length;
  const result: LineConfig = {
    status: "valid",
    cells: [...currentCell],
  };

  if (!hints.length) return result;
  const n = hints.length;

  // If the hint is [0], just mark everything with X
  if (hints[0] === 0) {
    result.cells = Array(length).fill("X");
    return result;
  }

  // Build HintInfo array
  const hintInfos: HintInfo[] = hints.map((len, i) => ({
    length: len,
    start: 0,
    end: 0,
  }));

  // Fine the earliest and latest start indexes
  const earliestIdx: number[] = new Array(n).fill(0);
  earliestIdx[0] = 0;
  for (let i = 1; i < n; i++) {
    earliestIdx[i] = earliestIdx[i - 1] + hints[i - 1] + 1;
  }

  const latestIdx: number[] = new Array(n).fill(0);
  latestIdx[n - 1] = length - hints[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    latestIdx[i] = latestIdx[i + 1] - hints[i] - 1;
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
  const totalHints = hints.reduce((sum, val) => sum + val, 0);

  // Invalid if total marks exceed hints
  if (totalOMarks > totalHints) invalid = true;

  // Invalid if hint configuration would exceed the length of the line
  if (totalHints + n - 1 > length) invalid = true;

  // Slide to the right based on constraints
  for (let i = 0; !invalid && i < earliestIdx.length; i++) {
    const blockStart = earliestIdx[i];
    const blockEnd = earliestIdx[i] + hints[i] - 1;

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
    const blockEnd = latestIdx[i] + hints[i] - 1;

    let firstX = checkForMark(currentCell, "X", false, blockStart, blockEnd);
    let slideAmt = 0;

    // Slide until current hint fits the constraint
    while (
      blockStart - slideAmt >= 0 &&
      (firstX >= 0 || currentCell[blockStart - slideAmt - 1] === "O")
    ) {
      if (firstX !== -1) {
        slideAmt += hints[i] - firstX;
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
      const possibleBlocks: number[] = [];

      for (let j = 0; j < n; j++) {
        const start = earliestIdx[j];
        const end = latestIdx[j] + hints[j] - 1;
        if (start <= i && end >= i) possibleBlocks.push(j);
      }

      if (possibleBlocks.length === 0) {
        invalid = true;
        break;
      }

      if (possibleBlocks.length === 1) {
        const j = possibleBlocks[0];
        earliestIdx[j] = Math.max(earliestIdx[j], i - hints[j] + 1);
        latestIdx[j] = Math.min(latestIdx[j], i);
      }
    }
  }

  // Create O groups for existing line
  const markGroups: { start: number; end: number; possibleHints: number[] }[] = [];
  for (let i = 0; i < length; i++) {
    if (currentCell[i] === "O") {
      if (i === 0 || currentCell[i - 1] !== "O")
        markGroups.push({ start: i, end: i, possibleHints: [] });
      else {
        markGroups[markGroups.length - 1].end = i;
      }
    }
  }

  // Loop through each O group and check if there are wrappable O's for owned hints
  for (let i = 0; i < markGroups.length; i++) {
    const { start, end } = markGroups[i];

    const groupLength = end - start + 1;
    for (let j = 0; j < n; j++) {
      if (groupLength > hints[j]) continue;

      if (start >= earliestIdx[j] && end <= latestIdx[j] + hints[j] - 1) {
        markGroups[i].possibleHints.push(j);
      }
    }

    if (markGroups[i].possibleHints.length === 0) {
      invalid = true;
      break;
    }

    // If the O group have the same hint number for all possible hints, and is equal to it, mark X's around it.
    const allExact = markGroups[i].possibleHints.every((j) => hints[j] === groupLength);
    if (allExact) {
      if (start > 0) result.cells[start - 1] = "X";
      if (end < length - 1) result.cells[end + 1] = "X";
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
    const overlapEnd = left + hints[i] - 1;

    if (overlapEnd >= right) {
      for (let j = right; j <= overlapEnd; j++) {
        result.cells[j] = "O";
      }
    }

    // Mark edges of this hint as X if earliest and latest are equal.
    if (left === right) {
      if (left > 0) result.cells[left - 1] = "X";
      if (overlapEnd < length - 1) result.cells[overlapEnd + 1] = "X";
    }
  }

  // Mark edges as X
  if (earliestIdx[0] > 0) {
    for (let i = 0; i < earliestIdx[0]; i++) {
      result.cells[i] = "X";
    }
  }

  const endBoundary = latestIdx[n - 1] + hints[n - 1] - 1;
  if (endBoundary < length) {
    for (let i = length - 1; i > endBoundary; i--) {
      result.cells[i] = "X";
    }
  }

  // Mark gaps between hints as X if the ranges do not intersect.
  for (let i = 0; i < n - 1; i++) {
    const currentEnd = latestIdx[i] + hints[i] - 1;
    const nextStart = earliestIdx[i + 1];
    if (currentEnd < nextStart - 1) {
      for (let j = currentEnd + 1; j <= nextStart - 1; j++) {
        result.cells[j] = "X";
      }
    }
  }

  return result;
}

// Solve the board.

export function solveBoard(config: SolverBoard, maxLoops: number = 0): SolvedBoard {
  const { grid, rows, cols, rowHints, colHints } = config;

  let solvingGrid: Cell[][] = grid
    ? structuredClone(grid)
    : Array.from({ length: rows }, () => Array.from({ length: cols }, () => "?"));

  let invalid = false;
  let changed: boolean;
  let count = 1;

  do {
    changed = false;

    // Each row
    for (let i = 0; i < solvingGrid.length; i++) {
      const currentLine: LineConfig = getOverlaps(solvingGrid[i], rowHints[i]);
      if (currentLine.status === "invalid") {
        console.error(
          "Returned invalid: ",
          currentLine.cells,
          "Row",
          i,
          rowHints[i],
          "Iteration",
          count,
        );
        invalid = true;
        break;
      }

      if (!arraysEqual(solvingGrid[i], currentLine.cells)) {
        changed = true;
        solvingGrid[i] = [...currentLine.cells];
      }
    }

    // Construct lines for each column and test
    const colLength = solvingGrid[0].length;
    const tempGrid: Cell[][] = Array.from({ length: colLength }, (_, i) =>
      solvingGrid.map((row) => row[i]),
    );

    for (let i = 0; i < tempGrid.length; i++) {
      const currentLine: LineConfig = getOverlaps(tempGrid[i], colHints[i]);
      if (currentLine.status === "invalid") {
        console.error("Returned invalid: ", currentLine.cells, colHints[i]);
        invalid = true;
        break;
      }

      if (!arraysEqual(tempGrid[i], currentLine.cells)) {
        changed = true;
        tempGrid[i] = [...currentLine.cells];
      }
    }

    solvingGrid = tempGrid[0].map((_, rowIndex) => tempGrid.map((col) => col[rowIndex]));
    count++;

    if (maxLoops > 0 && count >= maxLoops) {
      break;
    }
  } while (changed && !invalid);

  return {
    status: invalid ? "invalid" : "valid",
    grid: solvingGrid,
  };
}
