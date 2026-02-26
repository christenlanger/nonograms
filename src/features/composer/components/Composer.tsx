import { useEffect, useState, useRef } from "react";

import type { BoardLayout, Hints, DragMode, SolverBoard } from "@/shared/types";

import BoardComposer from "./BoardComposer";
import { calculateHints } from "../utils";

type Props = {
  onSave?: (solverBoard: SolverBoard) => void;
};

const dummyBoard: BoardLayout = {
  dimensions: {
    rows: 15,
    cols: 15,
  },
  separators: {
    rows: 5,
    cols: 5,
  },
  tiles: new Map(),
};

const initialHints: Hints = {
  rowHints: Array(dummyBoard.dimensions.rows).fill([0]),
  colHints: Array(dummyBoard.dimensions.cols).fill([0]),
};

export default function Composer({ onSave }: Props) {
  const [lastDragMode, setLastDragMode] = useState<DragMode>("unset");
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

  const handleOnClick = (index: number) => {
    if (!boardLayout) return;

    if (boardLayout.tiles.has(index)) {
      if (lastDragMode === "unset" || lastDragMode === "unmark") {
        if (lastDragMode === "unset") setLastDragMode("unmark");
        setBoardLayout((prev) => {
          const newTiles = new Map(prev.tiles);
          newTiles.delete(index);
          boardLayoutRef.current = {
            ...prev,
            tiles: newTiles,
          };
          return boardLayoutRef.current;
        });
      }
    } else if (lastDragMode === "unset" || lastDragMode === "mark") {
      if (lastDragMode === "unset") setLastDragMode("mark");
      setBoardLayout((prev) => {
        const newTiles = new Map(prev.tiles);
        newTiles.set(index, "O");
        boardLayoutRef.current = {
          ...prev,
          tiles: newTiles,
        };
        return boardLayoutRef.current;
      });
    }
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
    if (lastDragMode === "unset") return;

    const handlePointerUp = () => setLastDragMode("unset");

    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [lastDragMode]);

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
