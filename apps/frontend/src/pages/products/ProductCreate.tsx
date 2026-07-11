import { useState } from 'react';
import { Link } from 'react-router-dom';

type ProductFormState = {
  skuCode: string;
  name: string;
  category: 'MILK' | 'CRACKER';
  unit: string;
  isHeavy: boolean;
};

export default function ProductCreate() {
  const [form, setForm] = useState<ProductFormState>({
    skuCode: '',
    name: '',
    category: 'MILK',
    unit: '',
    isHeavy: false,
  });

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // eslint-disable-next-line no-console
  console.log('form', form); // TODO: xoá log này trước khi commit — chỉ để xác nhận state ở Task 28

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Thêm sản phẩm mới</h1>
          <p className="page-desc">Điền thông tin sản phẩm để thêm vào kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin sản phẩm</h2>
        </div>

        <form className="product-form">
          <div className="form-group">
            <label className="form-label" htmlFor="skuCode">
              Mã SKU
            </label>
            <input
              id="skuCode"
              name="skuCode"
              type="text"
              className="form-input"
              value={form.skuCode}
              onChange={(e) => updateField('skuCode', e.target.value)}
            />
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

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Tạo sản phẩm
            </button>
            <Link to="/" className="btn-secondary">
              Huỷ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
