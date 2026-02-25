import { Fragment } from "react/jsx-runtime";

import type { BoardLayout } from "@/shared/types";

import Tile from "./Tile";

type Props = {
  boardLayout: BoardLayout;
  onPointerDown?: (index: number) => void;
  onPointerEnter?: (index: number) => void;
};

export default function Board({ boardLayout, onPointerDown, onPointerEnter }: Props) {
  const { dimensions, separators, tiles } = boardLayout;

  const cssStyle = {
    "--repeat-cols": dimensions.cols,
    "--repeat-rows": dimensions.rows,
  } as React.CSSProperties;

  return (
    <div className="board" style={cssStyle}>
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
                onPointerDown={() => onPointerDown?.(index)}
                onPointerEnter={() => onPointerEnter?.(index)}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
