import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';

type EditFormState = {
  name: string;
  category: 'MILK' | 'CRACKER';
  unit: string;
  isHeavy: boolean;
};

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProductDetail(id);

  const [form, setForm] = useState<EditFormState | null>(null);

  // Chỉ khởi tạo form 1 lần khi product load xong — không ghi đè lại sau đó
  // để không mất dữ liệu người dùng đang gõ dở nếu refetch() được gọi lại.
  useEffect(() => {
    if (product && form === null) {
      setForm({
        name: product.name,
        category: product.category,
        unit: product.unit,
        isHeavy: product.isHeavy,
      });
    }
  }, [product, form]);

  function updateField<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
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

        <form className="product-form">
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

          {/* Nút submit thật + validate sẽ nối ở Task 35/36 */}
        </form>
      </section>
    </main>
  );
}
