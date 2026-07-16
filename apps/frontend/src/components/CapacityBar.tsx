// Progress Bar dùng chung cho màn hình Racking (Rack tổng + Slot chi tiết).
// Không đổi bố cục các màn hình khác — chỉ là 1 khối UI nhỏ, tái sử dụng được.

export type CapacityTier = 'empty' | 'green' | 'yellow' | 'orange' | 'red';

/**
 * Quy tắc màu theo tỉ lệ sử dụng:
 * - Chưa có hàng (used <= 0)  -> xám (empty)
 * - 0% - 50%                  -> xanh lá
 * - 51% - 80%                 -> vàng
 * - 81% - 95%                 -> cam
 * - 96% - 100%                -> đỏ
 */
export function getCapacityTier(percent: number, used: number): CapacityTier {
  if (used <= 0) return 'empty';
  if (percent >= 96) return 'red';
  if (percent >= 81) return 'orange';
  if (percent >= 51) return 'yellow';
  return 'green';
}

// Định dạng số kiểu Việt Nam: 10000 -> "10.000"
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

type CapacityBarProps = {
  percent: number;
  tier: CapacityTier;
  tooltip: string;
  size?: 'md' | 'sm';
};

export function CapacityBar({ percent, tier, tooltip, size = 'md' }: CapacityBarProps) {
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
      <div className={`capacity-progress-fill is-${tier}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
