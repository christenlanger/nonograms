import { describe, it, expect } from "vitest";
import { getHintFulfilled } from "../src/features/core/utils.ts";

describe("getHintFulfilled", () => {
  // ─────────────────────────────
  // Edge hint detection
  // ─────────────────────────────

  it("highlight hint", () => {
    const result = getHintFulfilled(["O", "X", "?", "?", "?"], [1, 2]);
    expect(result).toEqual([true, false]);
  });

  it("highlight hint mirrored", () => {
    const result = getHintFulfilled(["?", "?", "?", "X", "O"], [2, 1]);
    expect(result).toEqual([false, true]);
  });

  // ─────────────────────────────
  // No spaces on the edge detection
  // ─────────────────────────────

  it("solved hint due to no more valid spaces", () => {
    const result = getHintFulfilled(["?", "X", "O", "O", "X", "?", "X", "?", "X", "?"], [2, 1]);
    expect(result).toEqual([true, false]);
  });

  it("unsolved hint due to possible spaces", () => {
    const result = getHintFulfilled(["?", "X", "O", "O", "X", "?", "?", "X", "?", "X"], [2, 1]);
    expect(result).toEqual([false, false]);
  });

  it("solved hint due to no possible spaces adjacent to it", () => {
    const result = getHintFulfilled(["O", "O", "X", "?", "X", "O", "X", "?", "?", "?"], [2, 1, 2]);
    expect(result).toEqual([true, false, false]);
  });

  it("one mark with full hint", () => {
    const result = getHintFulfilled(["?", "?", "O", "?", "?"], [5]);
    expect(result).toEqual([false]);
  });

  it("all marks can only fit in their spaces but not fully marked", () => {
    const result = getHintFulfilled(["O", "?", "X", "?", "O"], [2, 2]);
    expect(result).toEqual([false, false]);
  });

  // ─────────────────────────────
  // Optimistic hint detection
  // ─────────────────────────────

  it("single optimistic hint", () => {
    const result = getHintFulfilled(["?", "?", "O", "?", "?"], [1], { optimistic: true });
    expect(result).toEqual([true]);
  });

  it("multiple optimistic hints", () => {
    const result = getHintFulfilled(["?", "O", "?", "O", "O"], [1, 2], { optimistic: true });
    expect(result).toEqual([true, true]);
  });

  it("complicated optimistic hints", () => {
    const result = getHintFulfilled(
      ["?", "O", "?", "O", "O", "?", "O", "?", "O", "O"],
      [1, 2, 1, 2],
      { optimistic: true },
    );
    expect(result).toEqual([true, true, true, true]);
  });

  it("hint not fulfilled", () => {
    const result = getHintFulfilled(["?", "?", "O", "?", "?"], [2], { optimistic: true });
    expect(result).toEqual([false]);
  });

  it("some hints not fulfilled", () => {
    const result = getHintFulfilled(["?", "O", "?", "O", "?"], [1, 2], { optimistic: true });
    expect(result).toEqual([false, false]);
  });

  it("similar hints but only one fulfilled", () => {
    const result = getHintFulfilled(["O", "?", "?", "?", "?"], [1, 1], { optimistic: true });
    expect(result).toEqual([false, false]);
  });

  it("some similar hints but only one fulfilled", () => {
    const result = getHintFulfilled(["?", "O", "?", "?", "?", "?", "?", "?", "?", "?"], [1, 2, 1], {
      optimistic: true,
    });
    expect(result).toEqual([false, false, false]);
  });
});
