import type { BoardData, SolverBoard } from "@/shared/types";
import { getBoard } from "@/shared/storage";

import Game from "@/features/game/Game";
import { useParams } from "react-router-dom";

export default function Puzzle() {
  const { id } = useParams<{ id: string }>();

  // TODO: Puzzle landing page
  if (!id) return <p>No board id supplied.</p>;

  // Might have to become a fetch
  const boardData: BoardData | undefined = getBoard(id);

  if (!boardData) return <p>Cannot find board id.</p>;

  const { rows, cols, rowHints, colHints } = boardData;
  const solverBoard: SolverBoard = {
    rows,
    cols,
    rowHints,
    colHints,
  };

  return (
    <>
      {solverBoard ? (
        <Game solverBoard={solverBoard} solution={boardData.solution} />
      ) : (
        <p>No config loaded.</p>
      )}
    </>
  );
}
