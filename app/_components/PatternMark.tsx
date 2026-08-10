import type { CSSProperties } from "react";

const ACTIVE_DOTS = [
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [1, 2],
  [5, 2],
  [1, 3],
  [5, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [1, 5],
  [1, 6],
  [1, 7],
] as const;

const PASSIVE_DOTS = Array.from({ length: 63 }, (_, index) => ({
  column: (index % 7) + 1,
  row: Math.floor(index / 7) + 1,
}));

type PatternMarkProps = {
  className?: string;
  compact?: boolean;
};

function positionStyle(column: number, row: number): CSSProperties {
  return { gridColumn: column, gridRow: row };
}

export function PatternMark({
  className = "",
  compact = false,
}: PatternMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`pattern-mark${compact ? " pattern-mark--compact" : ""} ${className}`.trim()}
    >
      {PASSIVE_DOTS.map(({ column, row }) => (
        <span
          className="pattern-mark__passive"
          key={`passive-${column}-${row}`}
          style={positionStyle(column, row)}
        />
      ))}
      <span
        className="pattern-mark__trace"
        style={positionStyle(5, 4)}
      />
      {ACTIVE_DOTS.map(([column, row]) => {
        const isSignal = column === 5 && row === 4;

        return (
          <span
            className={`pattern-mark__active${isSignal ? " pattern-mark__active--signal" : ""}`}
            key={`active-${column}-${row}`}
            style={positionStyle(column, row)}
          />
        );
      })}
    </span>
  );
}
