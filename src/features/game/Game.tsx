import { useReducer, useState } from "react";

import type { BoardLayout, Hints, HintMarks, SolverBoard } from "@/shared/types";

import InteractiveBoard from "../core/components/InteractiveBoard";
import Board from "../core/components/Board";
import { getHighlightedHints } from "../core/utils";

type Props = {
  solverBoard: SolverBoard;
  solution: number[];
};

type BoardState = {
  boardLayout: BoardLayout;
  hints: Hints;
};

type BoardStateAction = {
  type: "UPDATE";
  payload: BoardLayout;
};

function isUserSolved(answer: Set<number>, solution: number[]): boolean {
  if (answer.size !== solution.length) return false;

  for (const index of solution) {
    if (!answer.has(index)) return false;
  }

  return true;
}

function reducer(state: BoardState, action: BoardStateAction): BoardState {
  if (action.type === "UPDATE") {
    const boardLayout = action.payload;
    const { dimensions, tiles } = boardLayout;
    const { rows, cols } = dimensions;

    const markedHints: HintMarks = getHighlightedHints(rows, cols, state.hints, tiles);

    return {
      boardLayout: structuredClone(boardLayout),
      hints: {
        ...state.hints,
        rowMarks: markedHints.rowMarks,
        colMarks: markedHints.colMarks,
      },
    };
  }

  return state;
}

export default function Game({ solverBoard, solution }: Props) {
  const initialBoard = {
    dimensions: {
      rows: solverBoard.rows,
      cols: solverBoard.cols,
    },
    separators: {
      rows: 5,
      cols: 5,
    },
    tiles: new Map(),
  };

  const initialHints: Hints = {
    rowHints: solverBoard.rowHints,
    colHints: solverBoard.colHints,
  };

  const [isSolved, setIsSolved] = useState(false);
  const [boardState, dispatch] = useReducer(reducer, {
    boardLayout: initialBoard,
    hints: initialHints,
  });

  const handleBoardUpdate = (board: BoardLayout) => {
    const userSolution = new Set<number>();
    board.tiles.forEach((val, key) => {
      if (val === "O") userSolution.add(key);
    });

    dispatch({ type: "UPDATE", payload: board });

    if (isUserSolved(userSolution, solution)) setIsSolved(true);
  };

  return (
    <div className="nonogram">
      {isSolved ? (
        <Board
          boardLayout={boardState.boardLayout}
          hints={boardState.hints}
          disableButtons={true}
        />
      ) : (
        <InteractiveBoard
          boardLayout={boardState.boardLayout}
          hints={boardState.hints}
          onBoardUpdate={handleBoardUpdate}
        />
      )}
      <div className="game-message">
        <p>{isSolved && "Congratulations!"}</p>
      </div>
      <ul style={{ display: "flex", flexWrap: "wrap", listStyle: "none", gap: "0.5rem" }}>
        {solution.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
