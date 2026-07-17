import type { OutboundSuggestionResult } from '../types';
import { priorityBadgeClass, priorityLabel } from '../utils/schedule.utils';

type SmartPickingSuggestionCardProps = {
  loading: boolean;
  error: string | null;
  suggestion: OutboundSuggestionResult | null;
};

export function SmartPickingSuggestionCard({
  loading,
  error,
  suggestion,
}: SmartPickingSuggestionCardProps) {
  if (!loading && !error && !suggestion) return null;

  return (
    <div className="smart-card">
      <div className="smart-card-header">
        <span className="smart-card-title">🤖 Smart Picking Suggestion</span>
        {suggestion && <span className="badge badge-info">Đề xuất</span>}
      </div>

      {loading && <p className="smart-card-loading">Đang áp dụng nguyên tắc FEFO...</p>}

      {!loading && error && <p className="form-error">{error}</p>}

      {!loading && !error && suggestion && (
        <>
          <div className="smart-card-row">
            <span className="smart-card-label">Batch đề xuất</span>
            <span className="smart-card-value">{suggestion.batchCode}</span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Ngày hết hạn</span>
            <span className="smart-card-value">{suggestion.expiryDate}</span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Vị trí lấy hàng</span>
            <span className="smart-card-value">{suggestion.slotPath}</span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Số lượng khả dụng</span>
            <span className="smart-card-value">{suggestion.availableQuantity} units</span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Mức ưu tiên</span>
            <span className={priorityBadgeClass(suggestion.priority)}>
              {priorityLabel(suggestion.priority)}
            </span>
          </div>

          <div className="smart-card-row">
            <span className="smart-card-label">Selection Method</span>
            <span className="smart-card-value">{suggestion.selectionMethod}</span>
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

          {suggestion.splitRequired && (
            <p className="smart-card-warning">
              ⚠ 1 Batch không đủ số lượng — hệ thống sẽ gộp nhiều Batch theo FEFO khi thực hiện.
            </p>
          )}

          <p className="smart-card-note">
            Đây chỉ là Batch và vị trí được Smart WMS đề xuất. Hệ thống sẽ kiểm tra lại khi thực
            hiện lịch xuất kho.
          </p>
        </>
      )}
    </div>
  );
}
