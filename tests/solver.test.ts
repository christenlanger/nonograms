import { describe, it, expect } from "vitest";
import { getOverlaps } from "../src/features/solver/utils";

describe("getOverlaps", () => {
  // ─────────────────────────────
  // Basic overlap deduction
  // ─────────────────────────────

  it("fills center overlap for single large block", () => {
    const result = getOverlaps(Array(10).fill("?"), [6]);
    expect(result.cells.join("")).toBe("????OO????");
  });

  it("fills multiple independent overlaps", () => {
    const result = getOverlaps(Array(10).fill("?"), [2, 3, 2]);
    expect(result.cells.join("")).toBe("?O??OO??O?");
  });

  it("produces no overlap when block is flexible", () => {
    const result = getOverlaps(Array(5).fill("?"), [2]);
    expect(result.cells.includes("O")).toBe(false);
  });

  // ─────────────────────────────
  // Boundary restriction via X
  // ─────────────────────────────

  it("respects leading and trailing X boundaries", () => {
    const result = getOverlaps(["X", "?", "?", "?", "?", "?", "?", "?", "?", "X"], [5]);
    expect(result.cells.join("")).toBe("X???OO???X");
  });

  it("fills only valid region when isolated by X", () => {
    const result = getOverlaps(["X", "?", "X", "?", "X", "?", "?", "X", "?", "X"], [2]);
    expect(result.cells.join("")).toBe("XXXXXOOXXX");
  });

  it("eliminates impossible regions", () => {
    const result = getOverlaps(["?", "X", "?", "?", "X", "?", "?", "X", "?", "X"], [2]);
    expect(result.cells.join("")).toBe("XX??X??XXX");
  });

  // ─────────────────────────────
  // Existing O coverage (single block)
  // ─────────────────────────────

  it("forces coverage of lone O inside flexible row", () => {
    const result = getOverlaps(["?", "?", "?", "?", "?", "O", "?", "?", "?", "?"], [3]);
    expect(result.cells.join("")).toBe("XXX??O??XX");
  });

  it("does not over-constrain when O could belong to multiple blocks", () => {
    const result = getOverlaps(["?", "?", "?", "?", "?", "O", "?", "?", "?", "?"], [1, 2]);
    expect(result.cells.join("")).toBe("?????O????");
  });

  // ─────────────────────────────
  // Existing O coverage (multi-block)
  // ─────────────────────────────

  it("aligns blocks correctly with existing marks (forward)", () => {
    const result = getOverlaps(["X", "?", "X", "?", "X", "?", "?", "?", "?", "O"], [1, 4]);
    expect(result.cells.join("")).toBe("X?X?XXOOOO");
  });

  it("aligns blocks correctly with existing marks (reverse)", () => {
    const result = getOverlaps(["O", "?", "?", "?", "?", "X", "?", "X", "?", "X"], [4, 1]);
    expect(result.cells.join("")).toBe("OOOOXX?X?X");
  });

  it("assigns O to correct block when ownership is forced", () => {
    const result = getOverlaps(["O", "?", "O", "?", "?"], [1, 2]);
    expect(result.cells.join("")).toBe("OXOOX");
  });

  // ─────────────────────────────
  // Edge elimination
  // ─────────────────────────────

  it("eliminates impossible left cells near edge", () => {
    const result = getOverlaps(["?", "?", "?", "O", "?"], [2]);
    expect(result.cells.join("")).toBe("XX?O?");
  });

  it("eliminates impossible right cells near edge (mirror)", () => {
    const result = getOverlaps(["?", "O", "?", "?", "?"], [2]);
    expect(result.cells.join("")).toBe("?O?XX");
  });

  // ─────────────────────────────
  // Separator enforcement
  // ─────────────────────────────

  it("forces separator between adjacent blocks", () => {
    const result = getOverlaps(["?", "?", "?", "?", "?"], [2, 2]);
    // possible placements: _O_X_O_
    // middle cell must be X
    expect(result.cells.join("")).toBe("OOXOO");
  });

  it("prevents blocks from merging via existing O", () => {
    const result = getOverlaps(["O", "O", "?", "O", "O"], [2, 2]);
    expect(result.cells.join("")).toBe("OOXOO");
  });

  // ─────────────────────────────
  // Full coverage cases
  // ─────────────────────────────

  it("fills entire row when block equals row length", () => {
    const result = getOverlaps(Array(5).fill("?"), [5]);
    expect(result.cells.join("")).toBe("OOOOO");
  });

  it("detects impossible configuration (too many O)", () => {
    const result = getOverlaps(["O", "O", "O", "O"], [2]);
    // depending on your implementation this may:
    // - return unchanged
    // - mark invalid
    // - throw
    // adapt assertion to your design
    expect(result.status).toBe("invalid");
  });

  it("hints exceed the length of the line", () => {
    const result = getOverlaps(["?", "?", "?", "?"], [1, 1, 1, 1]);
    // The configuration of the hint will exceed the available
    // line when the separators are counted.
    expect(result.status).toBe("invalid");
  });

  it("existing O doesn't allow the hint configuration", () => {
    const result = getOverlaps(["?", "O", "?", "?"], [1, 2]);
    // The O prevents the second hint to be placed.
    expect(result.status).toBe("invalid");
  });
});
