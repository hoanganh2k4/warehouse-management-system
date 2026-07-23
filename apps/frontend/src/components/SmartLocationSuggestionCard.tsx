import type { InboundSuggestionResult } from '../types';
import { priorityBadgeClass, priorityLabel } from '../utils/schedule.utils';

type SmartLocationSuggestionCardProps = {
  loading: boolean;
  error: string | null;
  suggestion: InboundSuggestionResult | null;
};

export function SmartLocationSuggestionCard({
  loading,
  error,
  suggestion,
}: SmartLocationSuggestionCardProps) {
  if (!loading && !error && !suggestion) return null;

  return (
    <div className="smart-card">
      <div className="smart-card-header">
        <span className="smart-card-title">🤖 Smart Location Suggestion</span>
        {suggestion && <span className="badge badge-info">Đề xuất</span>}
      </div>

      {loading && <p className="smart-card-loading">Đang phân tích tình trạng kho...</p>}

      {!loading && error && <p className="form-error">{error}</p>}

      {!loading && !error && suggestion && (
        <>
          <div className="smart-card-row">
            <span className="smart-card-label">Đề xuất lưu tại</span>
            <span className="smart-card-value">
              {suggestion.zoneCode} / {suggestion.rackCode} / Level {suggestion.levelNumber} /{' '}
              {suggestion.slotCode}
            </span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Dung lượng sau khi nhập</span>
            <span className="smart-card-value">
              {suggestion.capacityAfter} / {suggestion.maxCapacity} units
            </span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Độ phù hợp</span>
            <span className="smart-card-value">{suggestion.score}%</span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Mức ưu tiên</span>
            <span className={priorityBadgeClass(suggestion.priority)}>
              {priorityLabel(suggestion.priority)}
            </span>
          </div>

          {suggestion.reasons.length > 0 && (
            <div className="smart-card-reasons">
              <span className="smart-card-label">Lý do đề xuất</span>
              <ul>
                {suggestion.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestion.alternativeSlots.length > 0 && (
            <details className="allocation-disclosure">
              <summary>
                <span>{suggestion.splitRequired ? '⚠ Phân bổ nhiều vị trí' : 'Vị trí sẽ sử dụng'}</span>
                <span className="allocation-summary-meta">
                  {suggestion.alternativeSlots.length} vị trí ·{' '}
                  {suggestion.alternativeSlots.reduce((sum, alt) => sum + alt.allocateQty, 0)} đơn vị
                </span>
              </summary>
              <ol className="allocation-list allocation-list-scroll">
                {suggestion.alternativeSlots.map((alt) => (
                  <li key={alt.slotId}>
                    <span className="smart-card-value">{alt.slotPath}</span>
                    <span><strong>{alt.allocateQty}</strong> đơn vị</span>
                    <span className="badge badge-info">{alt.score}%</span>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <p className="smart-card-note">
            Đây là vị trí được Smart WMS đề xuất dựa trên tình trạng kho tại thời điểm lập lịch.
            Khi thực hiện lịch nhập kho, hệ thống sẽ tự động kiểm tra lại toàn bộ dữ liệu kho và
            chạy lại thuật toán Smart Allocation để xác nhận vị trí lưu trữ tối ưu nhất.
          </p>
        </>
      )}
    </div>
  );
}
