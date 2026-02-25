import type { SolverBoard } from "./types";

type Props = {
  config: SolverBoard;
};

export default function Solver({ config }: Props) {
  const { rows, cols, grid, rowHints, colHints } = config;

  console.log(config);

  return <></>;
}
