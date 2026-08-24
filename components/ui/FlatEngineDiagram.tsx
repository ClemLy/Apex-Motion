/** A simplified top-down schematic of a boxer/flat engine: opposed cylinder
 * pairs straddling a horizontal crank axis — real architecture (see
 * `lib/heritage-data.ts`'s `cylinders` field), drawn as a technical diagram
 * rather than a photo, in the same "honest, not literal" spirit as the
 * site's other HUD readouts. */
export function FlatEngineDiagram({
  cylinders,
  className,
}: {
  cylinders: 4 | 6;
  className?: string;
}) {
  const pairs = cylinders / 2;
  const width = 220;
  const height = 120;
  const midY = height / 2;
  const r = 15;
  const bankOffset = 30;
  const spacing = width / (pairs + 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
    >
      <line x1={0} y1={midY} x2={width} y2={midY} strokeWidth={1} />
      {Array.from({ length: pairs }).map((_, i) => {
        const cx = spacing * (i + 1);
        return (
          <g key={i}>
            <line
              x1={cx}
              y1={midY - bankOffset + r}
              x2={cx}
              y2={midY - r}
              strokeWidth={1}
            />
            <line
              x1={cx}
              y1={midY + bankOffset - r}
              x2={cx}
              y2={midY + r}
              strokeWidth={1}
            />
            <circle cx={cx} cy={midY - bankOffset} r={r} strokeWidth={1.4} />
            <circle cx={cx} cy={midY + bankOffset} r={r} strokeWidth={1.4} />
          </g>
        );
      })}
    </svg>
  );
}
