import { useState } from "react";

import type { BoardLayout, Hints, SolverBoard } from "@/shared/types";

import { arraysEqual } from "@/shared/utils";

import InteractiveBoard from "../core/components/InteractiveBoard";
import Board from "../core/components/Board";

type Props = {
  solverBoard: SolverBoard;
  solution: number[];
};

export default function Game({ solverBoard, solution }: Props) {
  const [isSolved, setIsSolved] = useState(false);
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(() => ({
    dimensions: {
      rows: solverBoard.rows,
      cols: solverBoard.cols,
    },
    separators: {
      rows: 5,
      cols: 5,
    },
    tiles: new Map(),
  }));

  const boardHints: Hints = {
    rowHints: solverBoard.rowHints,
    colHints: solverBoard.colHints,
  };

  const handleBoardUpdate = (board: BoardLayout) => {
    const userSolution = Array.from(board.tiles.keys()).sort((a, b) => a - b);

    if (!arraysEqual(userSolution, solution)) return;

    setBoardLayout(board);
    setIsSolved(true);
  };

  return (
    <div className="nonogram">
      {isSolved ? (
        <Board boardLayout={boardLayout} hints={boardHints} disableButtons={true} />
      ) : (
        <InteractiveBoard
          boardLayout={boardLayout}
          hints={boardHints}
          onBoardUpdate={handleBoardUpdate}
        />
      )}
      <div className="game-message">
        <p>{isSolved && "Congratulations!"}</p>
      </div>
    </div>
  );
}
