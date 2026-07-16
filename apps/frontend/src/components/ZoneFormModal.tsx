import { useEffect, useState } from 'react';
import type { Zone, CreateZonePayload, UpdateZonePayload, Warehouse } from '../types';
import { warehouseService } from '../services/warehouse.service';

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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [form, setForm] = useState<ZoneFormState>({
    warehouseId: initialData?.warehouseId ?? '',
    code: initialData?.code ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Kho hàng để chọn — người dùng chọn theo tên, không phải tự gõ ID.
  useEffect(() => {
    if (mode !== 'create') return;
    let cancelled = false;
    warehouseService
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setWarehouses(result);
        setForm((prev) => (prev.warehouseId ? prev : { ...prev, warehouseId: result[0]?.id ?? '' }));
      })
      .finally(() => {
        if (!cancelled) setWarehousesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

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
    if (mode === 'create' && !form.warehouseId) {
      next.warehouseId = 'Vui lòng chọn kho hàng';
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
          warehouseId: form.warehouseId,
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
                Kho hàng
              </label>
              <select
                id="zone-warehouse-id"
                name="warehouseId"
                className="form-input"
                value={form.warehouseId}
                disabled={warehousesLoading}
                onChange={(e) => updateField('warehouseId', e.target.value)}
              >
                {warehousesLoading && <option value="">Đang tải...</option>}
                {!warehousesLoading && warehouses.length === 0 && (
                  <option value="">Chưa có kho hàng nào</option>
                )}
                {!warehousesLoading &&
                  warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
              </select>
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
