import type { Schedule } from '../types';
import { scheduleTypeLabel, scheduleStatusLabel } from '../utils/schedule.utils';

type ScheduleDetailModalProps = {
  schedule: Schedule;
  onClose: () => void;
};

export function ScheduleDetailModal({ schedule, onClose }: ScheduleDetailModalProps) {
  const partnerLabel = schedule.type === 'INBOUND' ? 'Nhà cung cấp' : 'Khách hàng';

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box dialog-box-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">
          {schedule.type === 'INBOUND' ? 'Chi tiết lịch nhập kho' : 'Chi tiết lịch xuất kho'}
        </h3>

        <div className="schedule-detail-grid">
          <span className="schedule-detail-label">Loại</span>
          <span>{scheduleTypeLabel(schedule.type)}</span>

          <span className="schedule-detail-label">Trạng thái</span>
          <span>{scheduleStatusLabel(schedule.status)}</span>

          <span className="schedule-detail-label">Ngày</span>
          <span>{schedule.scheduledDate}</span>

          <span className="schedule-detail-label">Giờ</span>
          <span>{schedule.scheduledTime}</span>

          <span className="schedule-detail-label">Sản phẩm</span>
          <span>
            {schedule.product ? `${schedule.product.skuCode} — ${schedule.product.name}` : '—'}
          </span>

          <span className="schedule-detail-label">Số lượng</span>
          <span>{schedule.quantity}</span>

          <span className="schedule-detail-label">{partnerLabel}</span>
          <span>{schedule.partnerName ?? '—'}</span>

          <span className="schedule-detail-label">Mã lô hàng</span>
          <span>{schedule.batchCode ?? '—'}</span>

          <span className="schedule-detail-label">Ghi chú</span>
          <span>{schedule.note ?? '—'}</span>

          {schedule.suggestion && (
            <>
              <span className="schedule-detail-label">Vị trí đề xuất</span>
              <span>{schedule.suggestion.slotPath ?? '—'}</span>
            </>
          )}

          {schedule.actual && (
            <>
              <span className="schedule-detail-label">Vị trí thực tế</span>
              <span>{schedule.actual.slotPath ?? '—'}</span>
            </>
          )}

          {schedule.status === 'CANCELLED' && (
            <>
              <span className="schedule-detail-label">Lý do hủy</span>
              <span>{schedule.cancelReason ?? '—'}</span>
            </>
          )}
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
