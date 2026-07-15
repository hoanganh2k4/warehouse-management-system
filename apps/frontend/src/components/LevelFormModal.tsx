import { useState } from 'react';
import type { Level, CreateLevelPayload, UpdateLevelPayload } from '../types';

type LevelFormState = {
  rackId: string;
  levelNumber: string;
};

type FormErrors = Partial<Record<keyof LevelFormState, string>>;

type LevelFormModalProps = {
  mode: 'create' | 'edit';
  initialData?: Level;
  rackId?: string;
  onSubmit: (payload: CreateLevelPayload | UpdateLevelPayload) => Promise<void>;
  onClose: () => void;
};

export function LevelFormModal({ mode, initialData, rackId, onSubmit, onClose }: LevelFormModalProps) {
  const [form, setForm] = useState<LevelFormState>({
    rackId: initialData?.rackId ?? rackId ?? '',
    levelNumber:
      initialData?.levelNumber !== undefined ? String(initialData.levelNumber) : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof LevelFormState>(key: K, value: LevelFormState[K]) {
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
    const num = Number(form.levelNumber);
    if (!form.levelNumber.trim() || Number.isNaN(num) || num <= 0) {
      next.levelNumber = 'Vui lòng nhập số tầng hợp lệ (> 0)';
    }
    if (mode === 'create' && !form.rackId.trim()) {
      next.rackId = 'Vui lòng chọn Rack';
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
      const levelNumber = Number(form.levelNumber);
      if (mode === 'create') {
        const payload: CreateLevelPayload = {
          rackId: form.rackId.trim(),
          levelNumber,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateLevelPayload = { levelNumber };
        await onSubmit(payload);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{mode === 'create' ? 'Thêm Level' : 'Sửa Level'}</h3>

        <form className="product-form" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label" htmlFor="level-rack-id">
                Rack ID
              </label>
              <input
                id="level-rack-id"
                name="rackId"
                type="text"
                className="form-input"
                placeholder="ID của Rack"
                value={form.rackId}
                onChange={(e) => updateField('rackId', e.target.value)}
                readOnly={Boolean(rackId)}
              />
              {errors.rackId && <p className="form-error">{errors.rackId}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="level-number">
              Số tầng
            </label>
            <input
              id="level-number"
              name="levelNumber"
              type="number"
              min={1}
              step={1}
              className="form-input"
              placeholder="ví dụ: 1"
              value={form.levelNumber}
              onChange={(e) => updateField('levelNumber', e.target.value)}
            />
            {errors.levelNumber && <p className="form-error">{errors.levelNumber}</p>}
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo Level' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
