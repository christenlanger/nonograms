import type { Cell } from "@/shared/types";

export function calculateHints(
  tiles: Map<number, Cell>,
  rows: number,
  cols: number,
  mode: "rows" | "cols",
): number[][] {
  const axis1Length = mode === "rows" ? rows : cols;
  const axis2Length = mode === "rows" ? cols : rows;

  const hints: number[][] = [];

  for (let i = 0; i < axis1Length; i++) {
    const hintRow: number[] = [];
    let count = 0;

    for (let j = 0; j < axis2Length; j++) {
      const index = mode === "rows" ? i * cols + j : j * cols + i;

      if (tiles.get(index) === "O") {
        count++;
      } else if (count > 0) {
        hintRow.push(count);
        count = 0;
      }
    }

    if (count > 0) hintRow.push(count);
    hints.push(hintRow.length > 0 ? hintRow : [0]);
  }

  return hints;
}
