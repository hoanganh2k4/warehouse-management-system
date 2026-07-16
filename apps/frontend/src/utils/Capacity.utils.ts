import type { CapacityTier } from "../components/CapacityBar";


export function getCapacityTier(
  percent: number,
  used: number,
): CapacityTier {
  if (used <= 0) return 'empty';
  if (percent >= 96) return 'red';
  if (percent >= 81) return 'orange';
  if (percent >= 51) return 'yellow';
  return 'green';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}