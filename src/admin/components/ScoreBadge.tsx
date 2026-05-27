interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const color =
    score >= 7
      ? 'text-[#308c5f] border-[#308c5f]/40 bg-[#308c5f]/10'
      : score >= 5
      ? 'text-[#b67820] border-[#b67820]/40 bg-[#b67820]/10'
      : 'text-[#b13b3f] border-[#b13b3f]/40 bg-[#b13b3f]/10';

  const sizeClass =
    size === 'sm'
      ? 'text-xs px-1.5 py-0.5'
      : size === 'lg'
      ? 'text-lg px-3 py-1'
      : 'text-sm px-2 py-0.5';

  return (
    <span
      className={`font-mono font-bold border rounded ${color} ${sizeClass} tabular-nums`}
    >
      {score.toFixed(1)}
    </span>
  );
}
