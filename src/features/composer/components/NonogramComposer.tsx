import { useState, useRef } from "react";

import type { BoardLayout, Hints, SolverBoard } from "@/shared/types";
import { dummyBoard, initialHints } from "@/shared/utils";
import { calculateHints } from "../utils";

import InteractiveBoard from "@/features/core/components/InteractiveBoard";

type Props = {
  onSave?: (solverBoard: SolverBoard) => void;
};

export default function NonogramComposer({ onSave }: Props) {
  // States for rendering. TODO: Convert to reducer to handle both states
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(dummyBoard);
  const [hints, setHints] = useState<Hints>(() => {
    const { tiles, dimensions } = dummyBoard;
    const { rows, cols } = dimensions;
    return {
      rowHints: calculateHints(tiles, rows, cols, "rows"),
      colHints: calculateHints(tiles, rows, cols, "cols"),
    };
  });

  // solverBoard ref for callbacks
  const solverBoard = useRef<SolverBoard>({
    rows: dummyBoard.dimensions.rows,
    cols: dummyBoard.dimensions.cols,
    rowHints: initialHints.rowHints,
    colHints: initialHints.colHints,
  });

  // Clear the board
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

  // Callback for saving board.
  const handleOnSave = () => {
    onSave?.({ ...solverBoard.current });
  };

  // Update the board. TODO: Convert to reducer
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

  const handleResizeBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoardLayout((prev) => ({
      ...prev,
      dimensions: {
        rows: event.target.name === "rows" ? Number(event.target.value) : prev.dimensions.rows,
        cols: event.target.name === "cols" ? Number(event.target.value) : prev.dimensions.cols,
      },
    }));
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
        <label>Rows</label>
        <input
          name="rows"
          type="number"
          min={5}
          max={20}
          value={boardLayout.dimensions.rows}
          onChange={handleResizeBoard}
        />
        <label>Columns</label>
        <input
          name="cols"
          type="number"
          min={5}
          max={20}
          value={boardLayout.dimensions.cols}
          onChange={handleResizeBoard}
        />
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleOnSave}>Save</button>
      </div>
    </div>
  );
}
