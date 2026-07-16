export type CapacityTier = 'empty' | 'green' | 'yellow' | 'orange' | 'red';

type CapacityBarProps = {
  percent: number;
  tier: CapacityTier;
  tooltip: string;
  size?: 'md' | 'sm';
};

export function CapacityBar({
  percent,
  tier,
  tooltip,
  size = 'md',
}: CapacityBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={`capacity-progress-track capacity-progress-track--${size} has-tooltip`}
      data-tooltip={tooltip}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`capacity-progress-fill is-${tier}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}