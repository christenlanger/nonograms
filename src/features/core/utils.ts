import type { Cell, Hints, HintMarks } from "@/shared/types";
import { checkForMark } from "@/shared/utils";

export function generateCells(rows: number, cols: number, tiles: Map<number, Cell>): Cell[][] {
  const output: Cell[][] = Array.from({ length: rows }, () => []);
  let count = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const value = tiles.get(count++);
      output[i].push(value ?? "?");
    }
  }

  return output;
}
interface HighlightOptions {
  optimistic?: boolean; // if true, highlight hints whenever an O exists, ignoring legality
}

// Simpler hint fulfilled function
export function getHintFulfilledSimple(
  line: Cell[],
  hints: number[],
  options?: HighlightOptions,
): boolean[] {
  const length = line.length;
  const { optimistic = false } = options ?? {};
  const n = hints.length;
  const fulfilled: boolean[] = Array(n).fill(false);

  if (optimistic) {
    // simple O-based fulfillment
    const groups: number[] = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "O") {
        if (i === 0 || line[i - 1] !== "O") groups.push(1);
        else groups[groups.length - 1]++;
      }
    }

    let allTrue = true;
    if (groups.length === n) {
      for (let i = 0; i < n; i++) {
        if (groups[i] !== hints[i]) allTrue = false;
      }
    } else {
      allTrue = false;
    }

    if (allTrue) {
      for (let i = 0; i < n; i++) {
        fulfilled[i] = true;
      }
    }

    return fulfilled;
  }

  const checkEdgeMarks = (options: { reverse?: boolean } = {}): boolean[] => {
    // Sweep from left, check if each O group is enclosed by X and no open spaces on the left
    const { reverse = false } = options;
    const fulfilled: boolean[] = Array(n).fill(false);
    const spaces: number[] = [];
    const markGroup: number[] = [];
    const matched: number[] = [];
    let lastMatchedGroup: number = -1;

    // Reverse line if set to reversed
    const curLine = reverse ? [...line].reverse() : [...line];

    for (let i = 0; i < length; i++) {
      const cell = curLine[i];

      // Check if it's a new group, otherwise increment corresponding group
      if (i === 0) {
        if (cell !== "X") {
          spaces.push(1);
          if (cell === "O") markGroup.push(1);
        }
      } else if (cell !== "X") {
        if (curLine[i - 1] === "X") {
          spaces.push(1);
          if (cell === "O") markGroup.push(1);
        } else {
          spaces[spaces.length - 1]++;
          if (cell === "O") markGroup[markGroup.length - 1]++;
        }
      } else {
        const groupIdx = markGroup.length - 1;

        if (groupIdx === lastMatchedGroup) continue;

        const lastGroup = markGroup[groupIdx];
        const matches = [];
        // Check if there's only one exact match for a space (with no wrapping)
        for (let j = 0; j < spaces.length; j++) {
          // Skip previously matched spaces
          if (matched.includes(j)) continue;
          // Exact match
          if (lastGroup === spaces[j]) matches.push(j);
          // We don't care for inaccurate match so doubling the match means there's space for
          // the block to move. Small logic trick to fulfill "one equal exact match only"
          if (lastGroup < spaces[j]) matches.push(j, j);
        }
        if (groupIdx < n && matches.length === 1) {
          const curHint = reverse ? [...hints].reverse()[groupIdx] : hints[groupIdx];
          if (lastGroup === curHint) {
            lastMatchedGroup = groupIdx;
            fulfilled[groupIdx] = true;
            matched.push(matches[0]);
          }
        }
      }
    }

    return reverse ? fulfilled.reverse() : fulfilled;
  };

  const leftSweep = checkEdgeMarks();
  const rightSweep = checkEdgeMarks({ reverse: true });

  for (let i = 0; i < fulfilled.length; i++) {
    fulfilled[i] = leftSweep[i] || rightSweep[i];
  }

  return fulfilled;
}

// Check fulfilled hints per line (doesn't mark incorrect placements)
export function getHintFulfilled(
  line: Cell[],
  hints: number[],
  options?: HighlightOptions,
): boolean[] {
  const length = line.length;
  const { optimistic = false } = options ?? {};
  const n = hints.length;
  const fulfilled: boolean[] = Array(n).fill(false);

  if (optimistic) {
    // simple O-based fulfillment
    const groups: number[] = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "O") {
        if (i === 0 || line[i - 1] !== "O") groups.push(1);
        else groups[groups.length - 1]++;
      }
    }

    let allTrue = true;
    if (groups.length === n) {
      for (let i = 0; i < n; i++) {
        if (groups[i] !== hints[i]) allTrue = false;
      }
    } else {
      allTrue = false;
    }

    if (allTrue) {
      for (let i = 0; i < n; i++) {
        fulfilled[i] = true;
      }
    }

    return fulfilled;
  }

  const placementsPerHint: number[][][] = Array.from({ length: n }, () => []);

  // Recursive helper
  const helper = (lineIndex: number, hintIndex: number, placementSoFar: number[][]) => {
    if (hintIndex === n) {
      // All hints placed
      for (let i = 0; i < n; i++) {
        if (!placementSoFar[i]) placementSoFar[i] = [];
        placementsPerHint[i].push([...placementSoFar[i]]);
      }
      return;
    }

    const hintLen = hints[hintIndex];

    // Slide this hint along the remaining line
    for (let start = lineIndex; start <= line.length - hintLen; start++) {
      // Check the cells are compatible
      let fits = true;
      for (let i = 0; i < hintLen; i++) {
        if (line[start + i] === "X") fits = false;
      }
      // Check boundaries (no adjacent O)
      if (
        (start > 0 && line[start - 1] === "O") ||
        (start + hintLen < line.length && line[start + hintLen] === "O")
      ) {
        fits = false;
      }
      if (!fits) continue;

      // Record this hint placement and recurse
      placementSoFar[hintIndex] = Array.from({ length: hintLen }, (_, idx) => start + idx);
      helper(start + hintLen + 1, hintIndex + 1, placementSoFar);
    }
  };

  helper(0, 0, Array(n));

  // For each hint, check if all placements agree on the same tiles
  for (let i = 0; i < n; i++) {
    if (placementsPerHint[i].length !== 0) {
      const cell = placementsPerHint[i][0][0];
      const leftBlocked = cell === 0 || line[cell - 1] === "X";
      const rightBlocked = cell + hints[i] === length || line[cell + hints[i]] === "X";

      if (
        !leftBlocked ||
        !rightBlocked ||
        checkForMark(line, "O", {
          exclusive: true,
          blockStart: cell,
          blockEnd: cell + hints[i] - 1,
        }) > -1
      ) {
        // No placement possible
        fulfilled[i] = false;
        continue;
      }

      const firstPlacement = placementsPerHint[i][0].join(",");
      const allAgree = placementsPerHint[i].every((p) => p.join(",") === firstPlacement);
      fulfilled[i] = allAgree;
    }
  }

  return fulfilled;
}

export function getHighlightedHints(
  rows: number,
  cols: number,
  hints: Hints,
  tiles: Map<number, Cell>,
  isStrict: boolean = true,
): HintMarks {
  const result: HintMarks = {
    rowMarks: [],
    colMarks: [],
  };

  const { rowHints, colHints } = hints;

  const grid: Cell[][] = generateCells(rows, cols, tiles);
  const rowCount = grid.length;
  const colCount = grid[0].length;

  const helper = (line: Cell[], hints: number[]): number[] => {
    const optimisticHints: boolean[] = getHintFulfilledSimple(line, hints, { optimistic: true });
    const allTrue = optimisticHints.every((hint) => hint);

    // If isStrict is set to false, return an empty array if optimistic hints is not fulfilled
    if (!isStrict && !allTrue) return [];

    const hintsFulfilled: boolean[] = allTrue
      ? optimisticHints
      : getHintFulfilledSimple(line, hints);
    const fulfilledIndexes: number[] = hintsFulfilled.reduce((acc: number[], val, idx) => {
      if (val) acc.push(idx);
      return acc;
    }, []);

    return fulfilledIndexes;
  };

  // Loop per row to check for marked hints. Move to next row if optimistic fulfills it
  for (let i = 0; i < rowCount; i++) {
    result.rowMarks?.push(helper(grid[i], rowHints[i]));
  }

  // Loop per column to check for marked hints
  for (let i = 0; i < colCount; i++) {
    const line: Cell[] = grid.map((row) => row[i]);
    result.colMarks?.push(helper(line, colHints[i]));
  }

  return result;
}
