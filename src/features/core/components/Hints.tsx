type Props = {
  hints: number[][];
  mode: "rows" | "cols";
};

export default function Hints({ hints, mode }: Props) {
  return (
    <div className={`board-${mode}-hints`}>
      {hints.map((hint, hintIdx) => (
        <ul key={`${mode}-hint-${hintIdx}`}>
          {hint.map((val, numIdx) => (
            <li key={`${mode}-hint-${hintIdx}-${numIdx}`}>{val}</li>
          ))}
        </ul>
      ))}
    </div>
  );
}
