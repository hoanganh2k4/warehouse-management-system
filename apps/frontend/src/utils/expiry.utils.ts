export type ExpiryStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';

export function getExpiryBadgeClass(status: ExpiryStatus): string {
  switch (status) {
    case 'EXPIRED':
      return 'expiry-badge is-expired';
    case 'CRITICAL':
      return 'expiry-badge is-critical';
    case 'WARNING':
      return 'expiry-badge is-warning';
    default:
      return 'expiry-badge is-ok';
  }
}

export function getExpiryLabel(status: ExpiryStatus, daysUntilExpiry: number): string {
  if (status === 'EXPIRED') {
    return `Đã hết hạn ${Math.abs(daysUntilExpiry)} ngày`;
  }

  if (status === 'CRITICAL' || status === 'WARNING') {
    return `Còn ${daysUntilExpiry} ngày`;
  }

  return 'Còn hạn';
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (number: number) => String(number).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
