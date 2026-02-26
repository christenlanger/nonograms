import { useRef } from "react";

import type { BoardLayout, Hints } from "@/shared/types";

import Board from "@/features/core/components/Board";

type Props = {
  boardLayout: BoardLayout;
  hints: Hints;
  onMark: (index: number) => void;
  onUpdateHints: () => void;
};

export default function BoardComposer({ boardLayout, hints, onMark, onUpdateHints }: Props) {
  const pointerDown = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
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

  return (
    <Board
      boardLayout={boardLayout}
      hints={hints}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
    />
  );
}
