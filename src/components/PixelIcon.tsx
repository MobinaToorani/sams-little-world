import { ICONS } from '../data/icons';

export function PixelIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const map = ICONS[name] ?? ICONS.paw;
  const n = map.length;
  const cells: JSX.Element[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '#') cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${map[0].length} ${n}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {cells}
    </svg>
  );
}
