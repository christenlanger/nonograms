import { useEffect, useRef, useState } from "react";

import type { DragMode, BoardLayout, ClickMode, Hints, Cell, HintMarks } from "@/shared/types";

import Board from "./Board";
import { getHighlightedHints } from "../utils";

type LocalBoardState = {
  board: BoardLayout;
  hints?: Hints;
};

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
  // localBoard state for rendering
  const [localBoardState, setLocalBoardState] = useState<LocalBoardState>(() => ({
    board: structuredClone(boardLayout),
    hints,
  }));

  // localBoard ref for callbacks. Should always be synced with board state
  const localBoardRef = useRef<BoardLayout>(structuredClone(boardLayout));

  // Tracker refs
  const pointerDown = useRef(false);
  const lastDragMode = useRef<DragMode>("unset");
  const clickMode = useRef<ClickMode>("left");
  const firstSymbol = useRef<Cell | undefined>(undefined);

  // Marking event
  const markTile = (index: number, clickMode: ClickMode) => {
    if (clickMode === "right" && disableX) return;

    setLocalBoardState((prev) => {
      const newTiles = new Map(prev.board.tiles);

      // Set drag mode accordingly
      if (lastDragMode.current === "unset") {
        lastDragMode.current = prev.board.tiles.has(index) ? "unmark" : "mark";
      }

      // Add or erase marks depending on drag mode
      if (lastDragMode.current === "mark") {
        newTiles.set(index, clickMode === "right" ? "X" : "O");
      } else if (lastDragMode.current === "unmark") {
        newTiles.delete(index);
      }

      // Update board ref and board state
      const newBoard = {
        ...prev.board,
        tiles: newTiles,
      };

      localBoardRef.current = newBoard;

      // Set marked hints if they are defined
      let newHints = hints ?? undefined;
      if (hints) {
        const { dimensions, tiles } = localBoardRef.current;
        const { rows, cols } = dimensions;

        const looseMarks: HintMarks = getHighlightedHints(rows, cols, hints, tiles);
        const strictMarks: HintMarks = getHighlightedHints(rows, cols, hints, tiles, true);

        const mergeMarks = (loose?: number[][], strict?: number[][], length = 0) =>
          Array.from({ length }, (_, i) => {
            if (loose?.[i]?.length) return [...loose[i]];
            if (strict?.[i]?.length) return [...strict[i]];
            return [];
          });

        const mergedMarks: HintMarks = {
          rowMarks: mergeMarks(looseMarks.rowMarks, strictMarks.rowMarks, hints.rowHints.length),
          colMarks: mergeMarks(looseMarks.colMarks, strictMarks.colMarks, hints.colHints.length),
        };

        newHints = { ...hints, ...mergedMarks };
      }

      return {
        board: newBoard,
        hints: newHints,
      };
    });
  };

  // Handles pointer down
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    const isRightClick = event.button === 2;
    const isMouseOrPen = event.pointerType === "mouse" || event.pointerType === "pen";

    clickMode.current = isRightClick && isMouseOrPen ? "right" : "left";

    pointerDown.current = true;

    // Record symbol on first square clicked.
    firstSymbol.current = localBoardState.board.tiles.get(index);

    // Mark or erase the tile accordingly
    markTile(index, clickMode.current);

    // Add event handler for lifting pointer.
    const handlePointerUp = () => {
      // Reset tracker refs
      pointerDown.current = false;
      lastDragMode.current = "unset";
      firstSymbol.current = undefined;

      // Send callback for parent to update board state
      onBoardUpdate?.(localBoardRef.current);

      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointerup", handlePointerUp);
  };

  // Handles pointer enter
  const handlePointerEnter = (index: number) => {
    // Don't execute if not holding pointer down
    if (!pointerDown.current) return;

    // When drawing X's, do not overwrite marked tiles
    if (
      clickMode.current === "right" &&
      lastDragMode.current === "mark" &&
      localBoardState.board.tiles.has(index)
    )
      return;

    // When erasing X's, do not erase marked tiles
    if (
      lastDragMode.current === "unmark" &&
      firstSymbol.current === "X" &&
      localBoardState.board.tiles.get(index) === "O"
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

  // Update localBoard ref when prop updates
  useEffect(() => {
    localBoardRef.current = structuredClone(boardLayout);
    setLocalBoardState((prev) => ({
      ...prev,
      board: localBoardRef.current,
    }));
  }, [boardLayout]);

  return (
    <Board
      boardLayout={localBoardState.board}
      hints={localBoardState.hints}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
    />
  );
}
