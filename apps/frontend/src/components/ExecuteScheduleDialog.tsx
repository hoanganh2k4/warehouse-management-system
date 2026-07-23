import { useEffect, useState } from 'react';
import { scheduleService } from '../services/schedule.service';
import type {
  ExecutePreviewResult,
  ExecuteSchedulePayload,
  InboundSuggestionResult,
  OutboundSuggestionResult,
  OverrideLocationPayload,
  Schedule,
} from '../types';
import { priorityBadgeClass, priorityLabel } from '../utils/schedule.utils';
import { OverrideLocationModal } from './OverrideLocationModal';

type ExecuteScheduleDialogProps = {
  schedule: Schedule;
  onClose: () => void;
  onExecuted: () => void;
};

function isOutboundSuggestion(
  recommended: InboundSuggestionResult | OutboundSuggestionResult,
): recommended is OutboundSuggestionResult {
  return 'batchCode' in recommended;
}

export function ExecuteScheduleDialog({ schedule, onClose, onExecuted }: ExecuteScheduleDialogProps) {
  const [preview, setPreview] = useState<ExecutePreviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [override, setOverride] = useState<OverrideLocationPayload | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const [actualBatchCode, setActualBatchCode] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    scheduleService
      .previewExecute(schedule.id)
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể chạy lại thuật toán.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schedule.id]);

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const payload: ExecuteSchedulePayload = {
        override: override ?? undefined,
      };
      if (schedule.type === 'INBOUND') {
        payload.actualBatchCode = actualBatchCode.trim() ? actualBatchCode.trim() : undefined;
        payload.manufactureDate = manufactureDate || undefined;
        payload.expiryDate = expiryDate || undefined;
      }
      await scheduleService.executeSchedule(schedule.id, payload);
      onExecuted();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Không thể thực hiện lịch. Vui lòng thử lại.');
    } finally {
      setConfirming(false);
    }
  }

  const recommended = preview?.recommended ?? null;
  const outboundInfo = recommended && isOutboundSuggestion(recommended) ? recommended : null;
  const isSame = preview?.isSameAsSuggested ?? false;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box dialog-box-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">
          {schedule.type === 'INBOUND' ? 'Thực hiện lịch nhập kho' : 'Thực hiện lịch xuất kho'}
        </h3>

        {loading && <p className="smart-card-loading">Đang chạy lại thuật toán Smart WMS...</p>}

        {!loading && error && <p className="form-error">{error}</p>}

        {!loading && !error && recommended && (
          <div className="smart-card">
            <div className="smart-card-header">
              <span className="smart-card-title">
                {isSame
                  ? '✓ Smart WMS đã xác nhận vị trí đề xuất'
                  : '🤖 Smart WMS đã cập nhật vị trí lưu trữ'}
              </span>
            </div>

            {isSame ? (
              <div className="smart-card-row">
                <span className="smart-card-label">Vị trí thực tế</span>
                <span className="smart-card-value">{recommended.slotPath}</span>
              </div>
            ) : (
              <div className="smart-card-row schedule-location-transition">
                <span className="smart-card-label">Vị trí đề xuất → thực tế</span>
                <span className="smart-card-value">
                  <span className="muted-cell">(vị trí lập lịch)</span> → {recommended.slotPath}
                </span>
              </div>
            )}

            {'alternativeSlots' in recommended && recommended.alternativeSlots.length > 0 && (
              <details className="allocation-disclosure">
                <summary>
                  <span>Phân bổ nhập kho</span>
                  <span className="allocation-summary-meta">
                    {recommended.alternativeSlots.length} vị trí ·{' '}
                    {recommended.alternativeSlots.reduce((sum, line) => sum + line.allocateQty, 0)} đơn vị
                  </span>
                </summary>
                <ol className="allocation-list allocation-list-scroll">
                  {recommended.alternativeSlots.map((line) => (
                    <li key={line.slotId}>
                      <span className="smart-card-value">{line.slotPath}</span>
                      <span><strong>{line.allocateQty}</strong> đơn vị</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            {outboundInfo?.pickingList && outboundInfo.pickingList.length > 0 && (
              <details className="allocation-disclosure">
                <summary>
                  <span>Phân bổ xuất kho</span>
                  <span className="allocation-summary-meta">
                    {outboundInfo.pickingList.length} vị trí ·{' '}
                    {outboundInfo.pickingList.reduce((sum, line) => sum + line.quantity, 0)} đơn vị
                  </span>
                </summary>
                <ol className="allocation-list allocation-list-scroll">
                  {outboundInfo.pickingList.map((line, index) => (
                    <li key={`${line.batchId}-${line.slotId}-${index}`}>
                      <span className="smart-card-value">{line.slotPath}</span>
                      <span>Batch <strong>{line.batchCode}</strong></span>
                      <span><strong>{line.quantity}</strong> đơn vị</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            {outboundInfo && (
              <>
                <div className="smart-card-row">
                  <span className="smart-card-label">Batch</span>
                  <span className="smart-card-value">{outboundInfo.batchCode}</span>
                </div>
                <div className="smart-card-row">
                  <span className="smart-card-label">Hạn sử dụng</span>
                  <span className="smart-card-value">{outboundInfo.expiryDate}</span>
                </div>
              </>
            )}

            <div className="smart-card-row">
              <span className="smart-card-label">Mức ưu tiên</span>
              <span className={priorityBadgeClass(recommended.priority)}>
                {priorityLabel(recommended.priority)}
              </span>
            </div>

            {recommended.reasons.length > 0 && (
              <div className="smart-card-reasons">
                <span className="smart-card-label">{isSame ? 'Lý do đề xuất' : 'Lý do thay đổi'}</span>
                <ul>
                  {recommended.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {override && (
              <p className="smart-card-note schedule-override-note">
                ✏ Đã chọn vị trí thủ công (Manual Override) — sẽ sử dụng thay cho đề xuất của hệ
                thống.
              </p>
            )}

            <div className="dialog-actions" style={{ justifyContent: 'flex-start', marginTop: 4 }}>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setShowOverrideModal(true)}>
                ✏ Thay đổi vị trí
              </button>
            </div>
          </div>
        )}

        {!loading && !error && schedule.type === 'INBOUND' && (
          <div className="form-row schedule-actual-batch-row">
            <div className="form-group">
              <label className="form-label" htmlFor="ex-actualBatchCode">
                Mã lô hàng thực tế
              </label>
              <input
                id="ex-actualBatchCode"
                type="text"
                className="form-input"
                placeholder={schedule.batchCode ?? 'Không bắt buộc'}
                value={actualBatchCode}
                onChange={(e) => setActualBatchCode(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ex-manufactureDate">
                Ngày sản xuất
              </label>
              <input
                id="ex-manufactureDate"
                type="date"
                className="form-input"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ex-expiryDate">
                Hạn sử dụng
              </label>
              <input
                id="ex-expiryDate"
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {confirmError && <p className="form-error">{confirmError}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={confirming}>
            Hủy
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={loading || !!error || confirming}
            onClick={handleConfirm}
          >
            {confirming ? 'Đang xử lý...' : 'Xác nhận thực hiện'}
          </button>
        </div>
      </div>

      {showOverrideModal && (
        <OverrideLocationModal
          saving={false}
          onClose={() => setShowOverrideModal(false)}
          onSave={(payload) => {
            setOverride(payload);
            setShowOverrideModal(false);
          }}
        />
      )}
    </div>
  );
}
