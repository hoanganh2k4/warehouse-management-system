import { useState } from 'react';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../types';

type ZoneFormState = {
  warehouseId: string;
  code: string;
};

type FormErrors = Partial<Record<keyof ZoneFormState, string>>;

type ZoneFormModalProps = {
  mode: 'create' | 'edit';
  initialData?: Zone;
  onSubmit: (payload: CreateZonePayload | UpdateZonePayload) => Promise<void>;
  onClose: () => void;
};

export function ZoneFormModal({ mode, initialData, onSubmit, onClose }: ZoneFormModalProps) {
  const [form, setForm] = useState<ZoneFormState>({
    warehouseId: initialData?.warehouseId ?? '',
    code: initialData?.code ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof ZoneFormState>(key: K, value: ZoneFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.code.trim()) next.code = 'Vui lòng nhập mã Zone';
    if (mode === 'create' && !form.warehouseId.trim()) {
      next.warehouseId = 'Vui lòng nhập warehouse ID';
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload: CreateZonePayload = {
          warehouseId: form.warehouseId.trim(),
          code: form.code.trim(),
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateZonePayload = { code: form.code.trim() };
        await onSubmit(payload);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{mode === 'create' ? 'Thêm Zone' : 'Sửa Zone'}</h3>

        <form className="product-form" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label" htmlFor="zone-warehouse-id">
                Warehouse ID
              </label>
              <input
                id="zone-warehouse-id"
                name="warehouseId"
                type="text"
                className="form-input"
                placeholder="ID của warehouse"
                value={form.warehouseId}
                onChange={(e) => updateField('warehouseId', e.target.value)}
              />
              {errors.warehouseId && <p className="form-error">{errors.warehouseId}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="zone-code">
              Mã Zone
            </label>
            <input
              id="zone-code"
              name="code"
              type="text"
              className="form-input"
              placeholder="ví dụ: Z01"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
            />
            {errors.code && <p className="form-error">{errors.code}</p>}
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo Zone' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
