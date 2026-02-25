type Props = {
  mark: string;
  isColBorder?: boolean;
  isRowBorder?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Tile({ mark, isColBorder, isRowBorder, ...props }: Props) {
  let cssClass = "tile";

  if (isColBorder) cssClass += " col-border";
  if (isRowBorder) cssClass += " row-border";

  return (
    <div className={cssClass}>
      <button className={mark} {...props}></button>
    </div>
  );
}
