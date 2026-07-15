import { useState } from 'react';
import type { Slot, CreateSlotPayload, UpdateSlotPayload } from '../types';

type SlotFormState = {
  levelId: string;
  code: string;
  maxCapacity: string;
  distanceToGate: string;
  outboundFrequencyScore: string;
};

type FormErrors = Partial<Record<keyof SlotFormState, string>>;

type SlotFormModalProps = {
  mode: 'create' | 'edit';
  initialData?: Slot;
  levelId?: string;
  onSubmit: (payload: CreateSlotPayload | UpdateSlotPayload) => Promise<void>;
  onClose: () => void;
};

export function SlotFormModal({ mode, initialData, levelId, onSubmit, onClose }: SlotFormModalProps) {
  const [form, setForm] = useState<SlotFormState>({
    levelId: initialData?.levelId ?? levelId ?? '',
    code: initialData?.code ?? '',
    maxCapacity: initialData?.maxCapacity !== undefined ? String(initialData.maxCapacity) : '',
    distanceToGate:
      initialData?.distanceToGate !== undefined ? String(initialData.distanceToGate) : '',
    outboundFrequencyScore:
      initialData?.outboundFrequencyScore !== undefined
        ? String(initialData.outboundFrequencyScore)
        : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof SlotFormState>(key: K, value: SlotFormState[K]) {
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

    if (!form.code.trim()) next.code = 'Vui lòng nhập mã Slot';

    const maxCapacity = Number(form.maxCapacity);
    if (!form.maxCapacity.trim() || Number.isNaN(maxCapacity) || maxCapacity <= 0) {
      next.maxCapacity = 'Vui lòng nhập sức chứa tối đa hợp lệ (> 0)';
    }

    const distanceToGate = Number(form.distanceToGate);
    if (!form.distanceToGate.trim() || Number.isNaN(distanceToGate) || distanceToGate < 0) {
      next.distanceToGate = 'Vui lòng nhập khoảng cách tới cổng hợp lệ (>= 0)';
    }

    if (mode === 'create' && !form.levelId.trim()) {
      next.levelId = 'Vui lòng chọn Level';
    }

    if (mode === 'edit' && form.outboundFrequencyScore.trim()) {
      const score = Number(form.outboundFrequencyScore);
      if (Number.isNaN(score) || score < 0) {
        next.outboundFrequencyScore = 'Điểm tần suất xuất phải là số >= 0';
      }
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
        const payload: CreateSlotPayload = {
          levelId: form.levelId.trim(),
          code: form.code.trim(),
          maxCapacity: Number(form.maxCapacity),
          distanceToGate: Number(form.distanceToGate),
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateSlotPayload = {
          code: form.code.trim(),
          maxCapacity: Number(form.maxCapacity),
          distanceToGate: Number(form.distanceToGate),
          ...(form.outboundFrequencyScore.trim()
            ? { outboundFrequencyScore: Number(form.outboundFrequencyScore) }
            : {}),
        };
        await onSubmit(payload);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{mode === 'create' ? 'Thêm Slot' : 'Sửa Slot'}</h3>

        <form className="product-form" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label" htmlFor="slot-level-id">
                Level ID
              </label>
              <input
                id="slot-level-id"
                name="levelId"
                type="text"
                className="form-input"
                placeholder="ID của Level"
                value={form.levelId}
                onChange={(e) => updateField('levelId', e.target.value)}
                readOnly={Boolean(levelId)}
              />
              {errors.levelId && <p className="form-error">{errors.levelId}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="slot-code">
              Mã Slot
            </label>
            <input
              id="slot-code"
              name="code"
              type="text"
              className="form-input"
              placeholder="ví dụ: S01"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
            />
            {errors.code && <p className="form-error">{errors.code}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slot-max-capacity">
              Sức chứa tối đa
            </label>
            <input
              id="slot-max-capacity"
              name="maxCapacity"
              type="number"
              min={1}
              step={1}
              className="form-input"
              placeholder="ví dụ: 100"
              value={form.maxCapacity}
              onChange={(e) => updateField('maxCapacity', e.target.value)}
            />
            {errors.maxCapacity && <p className="form-error">{errors.maxCapacity}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slot-distance">
              Khoảng cách tới cổng (m)
            </label>
            <input
              id="slot-distance"
              name="distanceToGate"
              type="number"
              min={0}
              step={0.1}
              className="form-input"
              placeholder="ví dụ: 12.5"
              value={form.distanceToGate}
              onChange={(e) => updateField('distanceToGate', e.target.value)}
            />
            {errors.distanceToGate && <p className="form-error">{errors.distanceToGate}</p>}
          </div>

          {mode === 'edit' && (
            <div className="form-group">
              <label className="form-label" htmlFor="slot-frequency-score">
                Điểm tần suất xuất (không bắt buộc)
              </label>
              <input
                id="slot-frequency-score"
                name="outboundFrequencyScore"
                type="number"
                min={0}
                step={0.1}
                className="form-input"
                placeholder="ví dụ: 0.8"
                value={form.outboundFrequencyScore}
                onChange={(e) => updateField('outboundFrequencyScore', e.target.value)}
              />
              {errors.outboundFrequencyScore && (
                <p className="form-error">{errors.outboundFrequencyScore}</p>
              )}
            </div>
          )}

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo Slot' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
