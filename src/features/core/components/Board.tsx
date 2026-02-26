import { Fragment } from "react/jsx-runtime";

import type { BoardLayout, Hints } from "@/shared/types";

import HintsList from "./Hints";
import Tile from "./Tile";

type Props = {
  boardLayout: BoardLayout;
  hints?: Hints;
  disableButtons?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>, index: number) => void;
  onPointerEnter?: (index: number) => void;
};

export default function Board({
  boardLayout,
  hints,
  disableButtons,
  onPointerDown,
  onPointerEnter,
}: Props) {
  const { dimensions, separators, tiles } = boardLayout;
  const { colHints, rowHints } = hints ?? {
    colHints: Array.from({ length: dimensions.cols }, () => [0]),
    rowHints: Array.from({ length: dimensions.rows }, () => [0]),
  };

  const cssStyle = {
    "--repeat-cols": dimensions.cols,
    "--repeat-rows": dimensions.rows,
  } as React.CSSProperties;

  return (
    <div className="board-container">
      <div className="placeholder"></div>
      <HintsList hints={colHints} mode="cols" />
      <HintsList hints={rowHints} mode="rows" />
      <div className="grid-container">
        <div className="board" style={cssStyle} onContextMenu={(e) => e.preventDefault()}>
          {Array.from({ length: dimensions.rows }, (_, row) => (
            <Fragment key={`row-${row}`}>
              {Array.from({ length: dimensions.cols }, (_, col) => {
                const index = row * dimensions.cols + col;
                const value = tiles?.get(index);
                const cssClass = value === "O" ? "marked" : value === "X" ? "crossed" : "";

                return (
                  <Tile
                    key={`tile-${row}-${col}`}
                    mark={cssClass}
                    isColBorder={separators?.cols !== undefined && col % separators.cols === 0}
                    isRowBorder={separators?.rows !== undefined && row % separators.rows === 0}
                    onPointerDown={(e) => onPointerDown?.(e, index)}
                    onPointerEnter={() => onPointerEnter?.(index)}
                    disabled={disableButtons}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
