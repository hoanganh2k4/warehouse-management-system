import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';

import { useSuppliers } from '../hooks/useSuppliers';
import type { CreateInboundSchedulePayload, InboundSuggestionResult, Product } from '../types';
import { SmartLocationSuggestionCard } from './SmartLocationSuggestionCard';
import { scheduleService } from '../services/schedule.service';

type InboundScheduleModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  scheduledDate: string;
  expiryDate: string;
  scheduledTime: string;
  supplierId: string;
  productId: string;
  quantity: string;
  batchCode: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  scheduledDate: '',
  expiryDate: '',
  scheduledTime: '',
  supplierId: '',
  productId: '',
  quantity: '',
  batchCode: '',
  note: '',
};

export function InboundScheduleModal({ onClose, onCreated }: InboundScheduleModalProps) {
  const { items: suppliers, loading: suppliersLoading } = useSuppliers();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<InboundSuggestionResult | null>(null);
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

  // Section 7: ngay khi Sản phẩm + Số lượng + Ngày nhập hợp lệ -> chạy Smart Location Suggestion
  useEffect(() => {
    const quantityNum = Number(form.quantity);
    const ready =
      !!form.productId && !!form.scheduledDate && Number.isInteger(quantityNum) && quantityNum > 0;

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
        .previewInbound({
          productId: form.productId,
          quantity: quantityNum,
          scheduledDate: form.scheduledDate,
          expiryDate: form.expiryDate || undefined,
        })
        .then((result) => {
          if (!cancelled) setSuggestion(result);
        })
        .catch((err) => {
          if (!cancelled) {
            setSuggestion(null);
            setSuggestionError(
              err instanceof Error ? err.message : 'Không thể tính toán vị trí đề xuất.',
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
  }, [form.productId, form.quantity, form.scheduledDate, form.expiryDate]);

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
    if (!state.scheduledDate) next.scheduledDate = 'Vui lòng chọn ngày nhập';
    if (!state.scheduledTime) next.scheduledTime = 'Vui lòng chọn giờ nhập';
    if (!state.supplierId) next.supplierId = 'Vui lòng chọn nhà cung cấp';
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

    const payload: CreateInboundSchedulePayload = {
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      expiryDate: form.expiryDate || undefined,
      supplierId: form.supplierId,
      productId: form.productId,
      quantity: Number(form.quantity),
      batchCode: form.batchCode.trim() ? form.batchCode.trim() : undefined,
      note: form.note.trim() ? form.note.trim() : undefined,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await scheduleService.createInbound(payload);
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể tạo lịch. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box dialog-box-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">Đặt lịch nhập kho</h3>

        <form className="product-form schedule-modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="in-scheduledDate">
                Ngày nhập
              </label>
              <input
                id="in-scheduledDate"
                type="date"
                className="form-input"
                value={form.scheduledDate}
                onChange={(e) => updateField('scheduledDate', e.target.value)}
              />
              {fieldError('scheduledDate') && <p className="form-error">{fieldError('scheduledDate')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="in-expiryDate">
                Hạn sử dụng dự kiến (nếu đã biết)
              </label>
              <input
                id="in-expiryDate"
                type="date"
                className="form-input"
                value={form.expiryDate}
                onChange={(e) => updateField('expiryDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="in-scheduledTime">
                Giờ nhập
              </label>
              <input
                id="in-scheduledTime"
                type="time"
                className="form-input"
                value={form.scheduledTime}
                onChange={(e) => updateField('scheduledTime', e.target.value)}
              />
              {fieldError('scheduledTime') && <p className="form-error">{fieldError('scheduledTime')}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="in-supplierId">
              Nhà cung cấp
            </label>
            <select
              id="in-supplierId"
              className="form-input"
              value={form.supplierId}
              disabled={suppliersLoading}
              onChange={(e) => updateField('supplierId', e.target.value)}
            >
              <option value="">
                {suppliersLoading ? 'Đang tải nhà cung cấp...' : '-- Chọn nhà cung cấp --'}
              </option>
              {!suppliersLoading &&
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            {fieldError('supplierId') && <p className="form-error">{fieldError('supplierId')}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="in-productId">
              Sản phẩm
            </label>
            <select
              id="in-productId"
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
              <label className="form-label" htmlFor="in-quantity">
                Số lượng
              </label>
              <input
                id="in-quantity"
                type="number"
                min={1}
                className="form-input"
                value={form.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
              />
              {fieldError('quantity') && <p className="form-error">{fieldError('quantity')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="in-batchCode">
                Mã lô hàng (Batch)
              </label>
              <input
                id="in-batchCode"
                type="text"
                className="form-input"
                placeholder="Không bắt buộc"
                value={form.batchCode}
                onChange={(e) => updateField('batchCode', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="in-note">
              Ghi chú
            </label>
            <textarea
              id="in-note"
              className="form-input"
              rows={2}
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
            />
          </div>

          <SmartLocationSuggestionCard
            loading={suggestionLoading}
            error={suggestionError}
            suggestion={suggestion}
          />

          {submitError && <p className="form-error">{submitError}</p>}

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang đặt lịch...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
