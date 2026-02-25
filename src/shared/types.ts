export type BoardLayout = {
  dimensions: {
    rows: number;
    cols: number;
  };
  separators?: {
    rows?: number;
    cols?: number;
  };
  tiles: Set<number>;
};

export type DragMode = "mark" | "unmark" | "unset";
