import { useEffect, useRef, useState } from "react";

import type { DragMode, BoardLayout, ClickMode, Hints } from "@/shared/types";

import Board from "./Board";

type Props = {
  boardLayout: BoardLayout;
  hints?: Hints;
  onBoardUpdate?: (boardLayout: BoardLayout) => void;
};

export default function InteractiveBoard({ boardLayout, hints, onBoardUpdate }: Props) {
  const [localBoard, setLocalBoard] = useState<BoardLayout>(boardLayout);
  const pointerDown = useRef(false);
  const lastDragMode = useRef<DragMode>("unset");
  const handlePointerUpRef = useRef<(() => void) | null>(null);
  const clickMode = useRef<ClickMode>("left");

  // Sets last drag mode
  const setLastDragMode = (mode: DragMode) => {
    lastDragMode.current = mode;

    const handlePointerUp = () => {
      lastDragMode.current = "unset";
      window.removeEventListener("pointerup", handlePointerUp);
    };
    handlePointerUpRef.current = handlePointerUp;

    window.addEventListener("pointerup", handlePointerUp);
  };

  // Marking event
  const handleMark = (index: number, clickMode: ClickMode) => {
    if (!localBoard) return;

    if (lastDragMode.current === "unset") {
      if (localBoard.tiles.has(index)) {
        setLastDragMode("unmark");
      } else {
        setLastDragMode("mark");
      }
    }

    setLocalBoard((prev) => {
      const newTiles = new Map(prev.tiles);

      if (lastDragMode.current === "mark") {
        newTiles.set(index, clickMode === "right" ? "X" : "O");
      } else if (lastDragMode.current === "unmark") {
        newTiles.delete(index);
      }

      return {
        ...prev,
        tiles: newTiles,
      };
    });
  };

  // Handles pointer down
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    const isRightClick = event.button === 2;
    const isMouseOrPen = event.pointerType === "mouse" || event.pointerType === "pen";

    clickMode.current = isRightClick && isMouseOrPen ? "right" : "left";

    pointerDown.current = true;
    handleMark(index, clickMode.current);

    const handlePointerUp = () => {
      pointerDown.current = false;

      onBoardUpdate?.(localBoard);

      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointerup", handlePointerUp);
  };

  // Handles pointer enter
  const handlePointerEnter = (index: number) => {
    if (pointerDown.current) handleMark(index, clickMode.current);
  };

  // Attach clean up for pointer up in case component unmounts while dragging
  useEffect(() => {
    return () => {
      if (handlePointerUpRef.current) {
        window.removeEventListener("pointerup", handlePointerUpRef.current);
        handlePointerUpRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setLocalBoard(boardLayout);
  }, [boardLayout]);

  return (
    <Board
      boardLayout={localBoard}
      hints={hints}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
    />
  );
}
