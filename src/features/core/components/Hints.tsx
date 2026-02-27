type Props = {
  hints: number[][];
  marked?: number[][];
  mode: "rows" | "cols";
};

export default function Hints({ hints, marked, mode }: Props) {
  return (
    <div className={`board-${mode}-hints`}>
      {hints.map((hint, hintIdx) => (
        <ul key={`${mode}-hint-${hintIdx}`}>
          {hint.map((val, numIdx) => (
            <li
              key={`${mode}-hint-${hintIdx}-${numIdx}`}
              className={marked && marked[hintIdx].includes(numIdx) ? "marked" : undefined}
            >
              {val}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
