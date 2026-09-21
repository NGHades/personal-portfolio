import "./ConfettiCluster.css";

const PALETTE = [
  "var(--color-accent)",
  "var(--color-accent-pink)",
  "var(--color-confetti-mint)",
  "var(--color-confetti-slate)",
  "var(--color-confetti-mauve)",
  "var(--color-confetti-tan)",
];

type ConfettiClusterProps = {
  count?: number;
  className?: string;
};

/** Decorative scattered squares — see design.md § About Me / Color Palette. */
export function ConfettiCluster({ count = 6, className = "" }: ConfettiClusterProps) {
  const squares = Array.from({ length: count }, (_, i) => PALETTE[i % PALETTE.length]);

  return (
    <div className={`confetti-cluster ${className}`} aria-hidden="true">
      {squares.map((color, i) => (
        <span key={i} className="confetti-square" style={{ background: color }} />
      ))}
    </div>
  );
}
