import { useEffect, useState, useRef } from "react";

import type { BoardLayout, DragMode } from "@/shared/types";
import type { Hints, SolverBoard } from "@/features/solver/types";

import BoardComposer from "./BoardComposer";

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
  tiles: new Set(),
};

export default function Composer({ onSave }: Props) {
  const [lastDragMode, setLastDragMode] = useState<DragMode>("unset");
  const solverBoard = useRef<SolverBoard>({
    rows: dummyBoard.dimensions.rows,
    cols: dummyBoard.dimensions.cols,
    grid: Array(dummyBoard.dimensions.rows).fill(Array(dummyBoard.dimensions.cols).fill("?")),
    rowHints: [],
    colHints: [],
  });
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(dummyBoard);

  const handleOnClick = (index: number) => {
    if (!boardLayout) return;

    if (boardLayout.tiles.has(index)) {
      if (lastDragMode === "unset" || lastDragMode === "unmark") {
        if (lastDragMode === "unset") setLastDragMode("unmark");
        setBoardLayout((prev) => ({
          ...prev,
          tiles: new Set([...prev.tiles].filter((cur) => cur !== index)),
        }));
      }
    } else if (lastDragMode === "unset" || lastDragMode === "mark") {
      if (lastDragMode === "unset") setLastDragMode("mark");
      setBoardLayout((prev) => ({
        ...prev,
        tiles: new Set([...prev.tiles, index]),
      }));
    }
  };

  const handleOnSave = () => {
    onSave?.({ ...solverBoard.current });
  };

  const handleUpdateHints = (hints: Hints) => {
    const { rowHints, colHints } = hints;
    solverBoard.current = {
      ...solverBoard.current,
      rowHints,
      colHints,
    };
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
          onMark={handleOnClick}
          onUpdateHints={handleUpdateHints}
        />
      )}
      <button onClick={handleOnSave}>Save</button>
    </div>
  );
}
