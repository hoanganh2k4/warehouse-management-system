import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useProductDetail } from '../../hooks/useProductDetail';
import { productService } from '../../services/product.service';
import { Toast } from '../../components/Toast';

type EditFormState = {
  name: string;
  category: 'MILK' | 'CRACKER';
  unit: string;
  isHeavy: boolean;
};

type EditFormErrors = Partial<Record<keyof EditFormState, string>>;

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProductDetail(id);

  const [form, setForm] = useState<EditFormState | null>(null);
  const [formInitializedFor, setFormInitializedFor] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Chỉ khởi tạo form 1 lần khi product load xong — không ghi đè lại sau đó
  // để không mất dữ liệu người dùng đang gõ dở nếu refetch() được gọi lại.
  // Đây là pattern "adjust state during render" của React thay vì dùng effect,
  // vì đây là suy ra state từ prop (product) chứ không phải đồng bộ hệ thống ngoài.
  if (product && formInitializedFor !== id) {
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      isHeavy: product.isHeavy,
    });
    setFormInitializedFor(id);
  }

  function updateField<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): EditFormErrors {
    if (!form) return {};
    const next: EditFormErrors = {};
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.unit.trim()) next.unit = 'Vui lòng nhập đơn vị tính';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !id) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await productService.updateProduct(id, {
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim(),
        isHeavy: form.isHeavy,
      });
      navigate(`/products/${id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setToastMessage('Sản phẩm không còn tồn tại (có thể đã bị xoá).');
      } else {
        setToastMessage('Không thể lưu thay đổi. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="app-content">
        <span className="skeleton" style={{ width: '200px', height: '28px' }} />
        <span className="skeleton" style={{ width: '120px', height: '18px', marginTop: 12 }} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-content">
        <div className="state-panel state-error">
          <p className="state-title">Không tải được thông tin sản phẩm</p>
          <p className="state-body">{error}</p>
          <button onClick={refetch}>Thử lại</button>
        </div>
      </main>
    );
  }

  if (!product || !form) {
    return null;
  }

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      <div className="page-header">
        <div>
          <Link to={`/products/${id}`} className="back-link">
            ← Quay lại chi tiết
          </Link>
          <p className="eyebrow">Catalog</p>
          <h1>Sửa sản phẩm</h1>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin sản phẩm</h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mã SKU</label>
            <p className="muted-cell">{product.skuCode} (không thể chỉnh sửa)</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Tên sản phẩm
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Danh mục
            </label>
            <select
              id="category"
              name="category"
              className="form-input"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as 'MILK' | 'CRACKER')}
            >
              <option value="MILK">Sữa (MILK)</option>
              <option value="CRACKER">Bánh quy (CRACKER)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="unit">
              Đơn vị
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              className="form-input"
              placeholder="ví dụ: hộp, thùng, kg"
              value={form.unit}
              onChange={(e) => updateField('unit', e.target.value)}
            />
            {errors.unit && <p className="form-error">{errors.unit}</p>}
          </div>

          <div className="form-group form-group-checkbox">
            <label className="form-label form-label-checkbox" htmlFor="isHeavy">
              <input
                id="isHeavy"
                name="isHeavy"
                type="checkbox"
                checked={form.isHeavy}
                onChange={(e) => updateField('isHeavy', e.target.checked)}
              />
              Hàng nặng (cần xử lý đặc biệt)
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <Link to={`/products/${id}`} className="btn-secondary">
              Huỷ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}