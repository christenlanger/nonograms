import { useState, useRef } from "react";

import type { BoardLayout, Hints, SolverBoard } from "@/shared/types";
import { calculateHints } from "../utils";

import InteractiveBoard from "@/features/core/components/InteractiveBoard";

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
  const solverBoard = useRef<SolverBoard>({
    rows: dummyBoard.dimensions.rows,
    cols: dummyBoard.dimensions.cols,
    rowHints: initialHints.rowHints,
    colHints: initialHints.colHints,
  });
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(dummyBoard);
  const [hints, setHints] = useState<Hints>(() => {
    const { tiles, dimensions } = dummyBoard;
    const { rows, cols } = dimensions;
    return {
      rowHints: calculateHints(tiles, rows, cols, "rows"),
      colHints: calculateHints(tiles, rows, cols, "cols"),
    };
  });

  const handleClear = () => {
    setBoardLayout((prev) => ({
      ...prev,
      tiles: new Map(),
    }));

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

  const handleUpdateBoard = (board: BoardLayout) => {
    const { tiles, dimensions } = board;
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

    setBoardLayout(board);
    setHints(hints);
  };

  return (
    <div className="nonogram">
      {boardLayout && (
        <InteractiveBoard
          boardLayout={boardLayout}
          hints={hints}
          disableX={true}
          onBoardUpdate={handleUpdateBoard}
        />
      )}
      <div className="composer-controls">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleOnSave}>Save</button>
      </div>
    </div>
  );
}
