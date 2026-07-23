// Ngưỡng cảnh báo hết hạn dùng CHUNG cho toàn bộ backend (Batch, Inventory, Dashboard...)
// để tránh mỗi nơi tự chọn 1 ngưỡng khác nhau gây lệch số liệu (giống lỗi đã sửa ở Task 86).
export const EXPIRY_WARNING_DAYS = 30;
export const EXPIRY_CRITICAL_DAYS = 7;

export type ExpiryStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED';

/**
 * Tính trạng thái hết hạn + số ngày còn lại từ 1 ngày hết hạn (expiryDate).
 * So sánh theo NGÀY dương lịch (bỏ giờ/phút/giây) để không bị lệch 1 ngày
 * tuỳ thời điểm server chạy trong ngày.
 */
export function getExpiryStatus(expiryDate: Date): {
  status: ExpiryStatus;
  daysUntilExpiry: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const daysUntilExpiry = Math.round(diffMs / (24 * 60 * 60 * 1000));

  let status: ExpiryStatus;
  if (daysUntilExpiry < 0) status = 'EXPIRED';
  else if (daysUntilExpiry <= EXPIRY_CRITICAL_DAYS) status = 'CRITICAL';
  else if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) status = 'WARNING';
  else status = 'OK';

  return { status, daysUntilExpiry };
}
