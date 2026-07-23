import { useEffect, useState } from 'react';
import { transactionService } from '../services/transaction.service';
import type { Transaction } from '../types';

type TransactionDetailModalProps = {
  transactionId: string;
  onClose: () => void;
};

type TransactionDetailContentProps = TransactionDetailModalProps;

type DetailState = {
  detail: Transaction | null;
  loading: boolean;
  error: string | null;
};

function transactionTypeLabel(type: Transaction['type']) {
  if (type === 'IMPORT') return 'Nhập kho';
  if (type === 'EXPORT') return 'Xuất kho';
  return 'Di chuyển';
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function TransactionDetailModal({ transactionId, onClose }: TransactionDetailModalProps) {
  return (
    <TransactionDetailContent
      key={transactionId}
      transactionId={transactionId}
      onClose={onClose}
    />
  );
}

function TransactionDetailContent({ transactionId, onClose }: TransactionDetailContentProps) {
  const [state, setState] = useState<DetailState>({
    detail: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    transactionService
      .getTransactionById(transactionId)
      .then((result) => {
        if (!cancelled) {
          setState({ detail: result, loading: false, error: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            detail: null,
            loading: false,
            error: 'Không tải được chi tiết giao dịch.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const { detail, loading, error } = state;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box dialog-box-wide" onClick={(event) => event.stopPropagation()}>
        <h3 className="dialog-title">Chi tiết giao dịch</h3>

        {loading && <p>Đang tải...</p>}
        {!loading && error && <p className="form-error">{error}</p>}

        {!loading && !error && detail && (
          <div className="schedule-detail-grid">
            <span className="schedule-detail-label">Mã đơn</span>
            <span>{detail.orderCode ?? '—'}</span>

            <span className="schedule-detail-label">Loại giao dịch</span>
            <span>{transactionTypeLabel(detail.type)}</span>

            <span className="schedule-detail-label">Sản phẩm</span>
            <span>
              {detail.productSkuCode} — {detail.productName}
            </span>

            <span className="schedule-detail-label">Mã lô hàng</span>
            <span>{detail.batchCode ?? '—'}</span>

            <span className="schedule-detail-label">Số lượng thay đổi</span>
            <span>{detail.quantity}</span>

            <span className="schedule-detail-label">Tồn kho trước</span>
            <span>{detail.quantityBefore ?? '—'}</span>

            <span className="schedule-detail-label">Tồn kho sau</span>
            <span>{detail.quantityAfter ?? '—'}</span>

            <span className="schedule-detail-label">Thứ tự trong ngày</span>
            <span>{detail.dailySeq ?? '—'}</span>

            <span className="schedule-detail-label">Từ vị trí</span>
            <span>{detail.slotFromCode ?? '—'}</span>

            <span className="schedule-detail-label">Đến vị trí</span>
            <span>{detail.slotToCode ?? '—'}</span>

            <span className="schedule-detail-label">Người thực hiện</span>
            <span>{detail.user.fullName ?? detail.user.username}</span>

            <span className="schedule-detail-label">Ghi chú</span>
            <span>{detail.note ?? '—'}</span>

            <span className="schedule-detail-label">Thời gian</span>
            <span>{formatDateTime(detail.createdAt)}</span>
          </div>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
