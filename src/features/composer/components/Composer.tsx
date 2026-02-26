import { useEffect, useState, useRef } from "react";

import type { BoardLayout, Hints, DragMode, SolverBoard } from "@/shared/types";

import BoardComposer from "./BoardComposer";
import { calculateHints } from "../utils";

type Props = {
  onSave?: (solverBoard: SolverBoard) => void;
};

const dummyBoard: BoardLayout = {
  dimensions: {
    rows: 10,
    cols: 10,
  },
  separators: {
    rows: 5,
    cols: 5,
  },
  tiles: new Map(),
};

const initialHints: Hints = {
  rowHints: Array.from({ length: dummyBoard.dimensions.rows }, () => [0]),
  colHints: Array.from({ length: dummyBoard.dimensions.cols }, () => [0]),
};

export default function Composer({ onSave }: Props) {
  const handlePointerUpRef = useRef<(() => void) | null>(null);
  const lastDragModeRef = useRef<DragMode>("unset");
  const solverBoard = useRef<SolverBoard>({
    rows: dummyBoard.dimensions.rows,
    cols: dummyBoard.dimensions.cols,
    rowHints: initialHints.rowHints,
    colHints: initialHints.colHints,
  });
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(dummyBoard);
  const boardLayoutRef = useRef<BoardLayout>(dummyBoard);
  const [hints, setHints] = useState<Hints>(() => {
    const { tiles, dimensions } = dummyBoard;
    const { rows, cols } = dimensions;
    return {
      rowHints: calculateHints(tiles, rows, cols, "rows"),
      colHints: calculateHints(tiles, rows, cols, "cols"),
    };
  });

  const setLastDragMode = (mode: DragMode) => {
    lastDragModeRef.current = mode;

    const handlePointerUp = () => {
      lastDragModeRef.current = "unset";
      window.removeEventListener("pointerup", handlePointerUp);
    };
    handlePointerUpRef.current = handlePointerUp;

    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleOnClick = (index: number) => {
    if (!boardLayout) return;

    if (lastDragModeRef.current === "unset") {
      if (boardLayout.tiles.has(index)) {
        setLastDragMode("unmark");
      } else {
        setLastDragMode("mark");
      }
    }

    setBoardLayout((prev) => {
      const newTiles = new Map(prev.tiles);
      if (lastDragModeRef.current === "mark") {
        newTiles.set(index, "O");
      } else if (lastDragModeRef.current === "unmark") {
        newTiles.delete(index);
      }

      boardLayoutRef.current = {
        ...prev,
        tiles: newTiles,
      };
      return boardLayoutRef.current;
    });
  };

  const handleClear = () => {
    setBoardLayout((prev) => {
      boardLayoutRef.current = {
        ...prev,
        tiles: new Map(),
      };
      return boardLayoutRef.current;
    });

    solverBoard.current = {
      ...solverBoard.current,
      rowHints: initialHints.rowHints,
      colHints: initialHints.colHints,
    };

    setHints(initialHints);
  };

  const handleOnSave = () => {
    onSave?.({ ...solverBoard.current });
  };

  const handleUpdateHints = () => {
    const { tiles, dimensions } = boardLayoutRef.current;
    const { rows, cols } = dimensions;
    const hints: Hints = {
      rowHints: calculateHints(tiles, rows, cols, "rows"),
      colHints: calculateHints(tiles, rows, cols, "cols"),
    };

    solverBoard.current = {
      ...solverBoard.current,
      rowHints: hints.rowHints,
      colHints: hints.colHints,
    };

    setHints(hints);
  };

  useEffect(() => {
    return () => {
      if (handlePointerUpRef.current) {
        window.removeEventListener("pointerup", handlePointerUpRef.current);
        handlePointerUpRef.current = null;
      }
    };
  }, []);

  return (
    <div className="nonogram">
      {boardLayout && (
        <BoardComposer
          boardLayout={boardLayout}
          hints={hints}
          onMark={handleOnClick}
          onUpdateHints={handleUpdateHints}
        />
      )}
      <div className="composer-controls">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleOnSave}>Save</button>
      </div>
    </div>
  );
}
