import { useState, useEffect } from "react";

import type { BoardLayout } from "@/shared/types";

import Board from "@/features/core/components/Board";
import HintsList from "@/features/core/components/Hints";
import { calculateHints } from "../utils";
import type { Hints } from "@/features/solver/types";

type Props = {
  boardLayout: BoardLayout;
  onMark: (index: number) => void;
  onUpdateHints: (hints: Hints) => void;
};

export default function BoardComposer({ boardLayout, onMark, onUpdateHints }: Props) {
  const { tiles, dimensions } = boardLayout;
  const { rows, cols } = dimensions;

  const [pointerDown, setPointerDown] = useState(false);
  const [hints, setHints] = useState<Hints>(() => {
    return {
      rowHints: calculateHints(tiles, rows, cols, "rows"),
      colHints: calculateHints(tiles, rows, cols, "cols"),
    };
  });

  const handlePointerDown = (index: number) => {
    setPointerDown(true);
    onMark(index);
  };

  const handlePointerEnter = (index: number) => {
    if (pointerDown) onMark(index);
  };

  useEffect(() => {
    const handlePointerUp = () => {
      setPointerDown(false);

      const hints = {
        rowHints: calculateHints(tiles, rows, cols, "rows"),
        colHints: calculateHints(tiles, rows, cols, "cols"),
      };

      setHints(hints);
      onUpdateHints(hints);
    };

    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onUpdateHints, pointerDown, cols, rows, tiles]);

  const { colHints, rowHints } = hints;

  return (
    <div className="board-container">
      <div className="placeholder"></div>
      <HintsList hints={colHints} mode="cols" />
      <HintsList hints={rowHints} mode="rows" />
      <Board
        boardLayout={boardLayout}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
      />
    </div>
  );
}
