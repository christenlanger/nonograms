import type { BoardData } from "./types";

import BOARD_DATA from "./boards.json";

const boardData = new Map<string, BoardData>(BOARD_DATA.map((item) => [item.id, item]));

export function getBoard(boardId: string): BoardData | undefined {
  return boardData.get(boardId);
}

export function generateRandomId(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const array = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(array)
    .map((n) => chars[n % chars.length])
    .join("");
}
