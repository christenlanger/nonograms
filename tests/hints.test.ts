import { describe, it, expect } from "vitest";
import { getHintFulfilled } from "../src/features/core/utils.ts";

describe("getHintFulfilled", () => {
  // ─────────────────────────────
  // Edge hint detection
  // ─────────────────────────────

  it("Highlight hint", () => {
    const result = getHintFulfilled(["O", "X", "?", "?", "?"], [1, 2]);
    expect(result).toEqual([true, false]);
  });
});
