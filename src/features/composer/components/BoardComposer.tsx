import { useRef } from "react";

import type { BoardLayout, Hints } from "@/shared/types";

import Board from "@/features/core/components/Board";
import HintsList from "@/features/core/components/Hints";

type Props = {
  boardLayout: BoardLayout;
  hints: Hints;
  onMark: (index: number) => void;
  onUpdateHints: () => void;
};

export default function BoardComposer({ boardLayout, hints, onMark, onUpdateHints }: Props) {
  const pointerDown = useRef(false);

  const handlePointerDown = (index: number) => {
    pointerDown.current = true;
    onMark(index);

    const handlePointerUp = () => {
      pointerDown.current = false;

      onUpdateHints();

      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerEnter = (index: number) => {
    if (pointerDown.current) onMark(index);
  };

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
