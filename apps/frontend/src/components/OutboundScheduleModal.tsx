import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import { scheduleService } from '../services/schedule.service';
import { useCustomers } from '../hooks/useCustomers';
import type { CreateOutboundSchedulePayload, OutboundSuggestionResult, Product } from '../types';
import { SmartPickingSuggestionCard } from './SmartPickingSuggestionCard';

type OutboundScheduleModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  scheduledDate: string;
  scheduledTime: string;
  customerId: string;
  productId: string;
  quantity: string;
  batchCode: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  scheduledDate: '',
  scheduledTime: '',
  customerId: '',
  productId: '',
  quantity: '',
  batchCode: '',
  note: '',
};

export function OutboundScheduleModal({ onClose, onCreated }: OutboundScheduleModalProps) {
  const { items: customers, loading: customersLoading } = useCustomers();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<OutboundSuggestionResult | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productService
      .getProducts({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled) setProducts(result.items);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Section 10: ngay khi Sản phẩm + Số lượng hợp lệ -> chạy Smart Picking Suggestion (FEFO)
  useEffect(() => {
    const quantityNum = Number(form.quantity);
    const ready = !!form.productId && Number.isInteger(quantityNum) && quantityNum > 0;

    let cancelled = false;

    function runPreview() {
      if (!ready) {
        setSuggestion(null);
        setSuggestionError(null);
        return;
      }

      setSuggestionLoading(true);
      setSuggestionError(null);
    }

    runPreview();
    if (!ready) return;

    const timer = setTimeout(() => {
      scheduleService
        .previewOutbound({ productId: form.productId, quantity: quantityNum })
        .then((result) => {
          if (!cancelled) setSuggestion(result);
        })
        .catch((err) => {
          if (!cancelled) {
            setSuggestion(null);
            setSuggestionError(
              err instanceof Error ? err.message : 'Không thể đề xuất Batch/vị trí lấy hàng.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setSuggestionLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.productId, form.quantity]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(state: FormState): FormErrors {
    const next: FormErrors = {};
    if (!state.scheduledDate) next.scheduledDate = 'Vui lòng chọn ngày xuất';
    if (!state.scheduledTime) next.scheduledTime = 'Vui lòng chọn giờ xuất';
    if (!state.customerId) next.customerId = 'Vui lòng chọn khách hàng';
    if (!state.productId) next.productId = 'Vui lòng chọn sản phẩm';

    const quantityNum = Number(state.quantity);
    if (!state.quantity || !Number.isInteger(quantityNum) || quantityNum < 1) {
      next.quantity = 'Số lượng phải là số nguyên dương';
    }

    return next;
  }


  function fieldError(field: keyof FormState) {
    return errors[field];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateOutboundSchedulePayload = {
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      customerId: form.customerId,
      productId: form.productId,
      quantity: Number(form.quantity),
      batchCode: form.batchCode.trim() ? form.batchCode.trim() : undefined,
      note: form.note.trim() ? form.note.trim() : undefined,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await scheduleService.createOutbound(payload);
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể tạo lịch. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box dialog-box-schedule-create" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">Đặt lịch xuất kho</h3>

        <form className="product-form schedule-modal-form" onSubmit={handleSubmit}>
          <div className="schedule-create-layout">
            <div className="schedule-create-fields">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="out-scheduledDate">
                Ngày xuất
              </label>
              <input
                id="out-scheduledDate"
                type="date"
                className="form-input"
                value={form.scheduledDate}
                onChange={(e) => updateField('scheduledDate', e.target.value)}
              />
              {fieldError('scheduledDate') && <p className="form-error">{fieldError('scheduledDate')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="out-scheduledTime">
                Giờ xuất
              </label>
              <input
                id="out-scheduledTime"
                type="time"
                className="form-input"
                value={form.scheduledTime}
                onChange={(e) => updateField('scheduledTime', e.target.value)}
              />
              {fieldError('scheduledTime') && <p className="form-error">{fieldError('scheduledTime')}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="out-customerId">
              Khách hàng
            </label>
            <select
              id="out-customerId"
              className="form-input"
              value={form.customerId}
              disabled={customersLoading}
              onChange={(e) => updateField('customerId', e.target.value)}
            >
              <option value="">
                {customersLoading ? 'Đang tải khách hàng...' : '-- Chọn khách hàng --'}
              </option>
              {!customersLoading &&
                customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            {fieldError('customerId') && <p className="form-error">{fieldError('customerId')}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="out-productId">
              Sản phẩm
            </label>
            <select
              id="out-productId"
              className="form-input"
              value={form.productId}
              disabled={productsLoading}
              onChange={(e) => updateField('productId', e.target.value)}
            >
              <option value="">
                {productsLoading ? 'Đang tải sản phẩm...' : '-- Chọn sản phẩm --'}
              </option>
              {!productsLoading &&
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.skuCode} — {p.name}
                  </option>
                ))}
            </select>
            {fieldError('productId') && <p className="form-error">{fieldError('productId')}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="out-quantity">
                Số lượng
              </label>
              <input
                id="out-quantity"
                type="number"
                min={1}
                className="form-input"
                value={form.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
              />
              {fieldError('quantity') && <p className="form-error">{fieldError('quantity')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="out-batchCode">
                Mã lô hàng (Batch)
              </label>
              <input
                id="out-batchCode"
                type="text"
                className="form-input"
                placeholder="Không bắt buộc"
                value={form.batchCode}
                onChange={(e) => updateField('batchCode', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="out-note">
              Ghi chú
            </label>
            <textarea
              id="out-note"
              className="form-input"
              rows={2}
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
            />
          </div>

              {submitError && <p className="form-error">{submitError}</p>}

              <div className="dialog-actions schedule-create-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang đặt lịch...' : 'Đặt lịch'}
            </button>
              </div>
            </div>

            <aside className="schedule-create-suggestion" aria-live="polite">
              <SmartPickingSuggestionCard
                loading={suggestionLoading}
                error={suggestionError}
                suggestion={suggestion}
              />
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
