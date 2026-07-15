import { useState } from 'react';
import type { Rack, CreateRackPayload, UpdateRackPayload } from '../types';

type RackFormState = {
  zoneId: string;
  code: string;
};

type FormErrors = Partial<Record<keyof RackFormState, string>>;

type RackFormModalProps = {
  mode: 'create' | 'edit';
  initialData?: Rack;
  zoneId?: string;
  onSubmit: (payload: CreateRackPayload | UpdateRackPayload) => Promise<void>;
  onClose: () => void;
};

export function RackFormModal({ mode, initialData, zoneId, onSubmit, onClose }: RackFormModalProps) {
  const [form, setForm] = useState<RackFormState>({
    zoneId: initialData?.zoneId ?? zoneId ?? '',
    code: initialData?.code ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof RackFormState>(key: K, value: RackFormState[K]) {
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
    if (!form.code.trim()) next.code = 'Vui lòng nhập mã Rack';
    if (mode === 'create' && !form.zoneId.trim()) {
      next.zoneId = 'Vui lòng chọn Zone';
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
        const payload: CreateRackPayload = {
          zoneId: form.zoneId.trim(),
          code: form.code.trim(),
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateRackPayload = { code: form.code.trim() };
        await onSubmit(payload);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{mode === 'create' ? 'Thêm Rack' : 'Sửa Rack'}</h3>

        <form className="product-form" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label" htmlFor="rack-zone-id">
                Zone ID
              </label>
              <input
                id="rack-zone-id"
                name="zoneId"
                type="text"
                className="form-input"
                placeholder="ID của Zone"
                value={form.zoneId}
                onChange={(e) => updateField('zoneId', e.target.value)}
                readOnly={Boolean(zoneId)}
              />
              {errors.zoneId && <p className="form-error">{errors.zoneId}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="rack-code">
              Mã Rack
            </label>
            <input
              id="rack-code"
              name="code"
              type="text"
              className="form-input"
              placeholder="ví dụ: R01"
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
              {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo Rack' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
