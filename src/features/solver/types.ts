import type { Cell } from "@/shared/types";

export type LineConfig = {
  status: "valid" | "invalid";
  cells: Cell[];
};

export type SolvedBoard = {
  status: "valid" | "invalid";
  grid: Cell[][];
  count: number;
};

export interface HintInfo {
  length: number;
  start: number;
  end: number;
}
