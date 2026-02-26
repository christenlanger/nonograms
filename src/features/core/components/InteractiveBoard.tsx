import { useEffect, useRef, useState } from "react";

import type { DragMode, BoardLayout, ClickMode, Hints } from "@/shared/types";

import Board from "./Board";

type Props = {
  boardLayout: BoardLayout;
  hints?: Hints;
  disableX?: boolean;
  onBoardUpdate?: (boardLayout: BoardLayout) => void;
};

export default function InteractiveBoard({
  boardLayout,
  hints,
  disableX = false,
  onBoardUpdate,
}: Props) {
  const [localBoard, setLocalBoard] = useState<BoardLayout>(() => structuredClone(boardLayout));
  const localBoardRef = useRef<BoardLayout>(structuredClone(boardLayout));
  const pointerDown = useRef(false);
  const lastDragMode = useRef<DragMode>("unset");
  const clickMode = useRef<ClickMode>("left");

  // Marking event
  const markTile = (index: number, clickMode: ClickMode) => {
    if (clickMode === "right" && disableX) return;

    setLocalBoard((prev) => {
      const newTiles = new Map(prev.tiles);

      if (lastDragMode.current === "unset") {
        lastDragMode.current = prev.tiles.has(index) ? "unmark" : "mark";
      }

      if (lastDragMode.current === "mark") {
        newTiles.set(index, clickMode === "right" ? "X" : "O");
      } else if (lastDragMode.current === "unmark") {
        newTiles.delete(index);
      }

      const newBoard = {
        ...prev,
        tiles: newTiles,
      };

      localBoardRef.current = newBoard;
      return newBoard;
    });
  };

  // Handles pointer down
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    const isRightClick = event.button === 2;
    const isMouseOrPen = event.pointerType === "mouse" || event.pointerType === "pen";

    clickMode.current = isRightClick && isMouseOrPen ? "right" : "left";

    pointerDown.current = true;
    markTile(index, clickMode.current);

    const handlePointerUp = () => {
      pointerDown.current = false;
      lastDragMode.current = "unset";
      onBoardUpdate?.(localBoardRef.current);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointerup", handlePointerUp);
  };

  // Handles pointer enter
  const handlePointerEnter = (index: number) => {
    if (!pointerDown.current) return;

    if (
      clickMode.current === "right" &&
      lastDragMode.current === "mark" &&
      localBoard.tiles.has(index)
    )
      return;

    markTile(index, clickMode.current);
  };

  // Attach clean up for pointer up in case component unmounts while dragging
  useEffect(() => {
    return () => {
      lastDragMode.current = "unset";
      pointerDown.current = false;
    };
  }, []);

  useEffect(() => {
    localBoardRef.current = structuredClone(boardLayout);
    setLocalBoard(localBoardRef.current);
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
