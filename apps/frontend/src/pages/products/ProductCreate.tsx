import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { productService } from '../../services/product.service';
import { useCategories } from '../../hooks/useCategories';
import { Toast } from '../../components/Toast';

type ProductFormState = {
  skuCode: string;
  name: string;
  categoryId: string;
  unit: string;
  isHeavy: boolean;
};

type FormErrors = Partial<Record<keyof ProductFormState, string>>;

export default function ProductCreate() {
  const { items: categories, loading: categoriesLoading } = useCategories();
  const [form, setForm] = useState<ProductFormState>({
    skuCode: '',
    name: '',
    categoryId: '',
    unit: '',
    isHeavy: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Khi danh sách category tải xong, tự chọn category đầu tiên làm mặc định
  // (thay cho giá trị cứng 'MILK' trước đây) — chỉ set nếu form chưa chọn gì.
  if (!categoriesLoading && categories.length > 0 && !form.categoryId) {
    setForm((prev) => ({ ...prev, categoryId: categories[0].id }));
  }

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
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
    if (!form.skuCode.trim()) next.skuCode = 'Vui lòng nhập mã SKU';
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.categoryId) next.categoryId = 'Vui lòng chọn danh mục';
    if (!form.unit.trim()) next.unit = 'Vui lòng nhập đơn vị tính';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await productService.createProduct({
        skuCode: form.skuCode.trim(),
        name: form.name.trim(),
        categoryId: form.categoryId,
        unit: form.unit.trim(),
        isHeavy: form.isHeavy,
      });
      navigate(`/products/${created.id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage(
          err.response.data?.message === 'SKU already exists'
            ? 'Mã SKU này đã tồn tại. Vui lòng chọn mã khác.'
            : 'Dữ liệu bị trùng, vui lòng kiểm tra lại.',
        );
      } else {
        setToastMessage('Không thể tạo sản phẩm. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Danh mục</p>
          <h1>Thêm sản phẩm mới</h1>
          <p className="page-desc">Điền thông tin sản phẩm để thêm vào kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin sản phẩm</h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
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
            {errors.skuCode && <p className="form-error">{errors.skuCode}</p>}
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
              value={form.categoryId}
              disabled={categoriesLoading}
              onChange={(e) => updateField('categoryId', e.target.value)}
            >
              {categoriesLoading && <option value="">Đang tải danh mục...</option>}
              {!categoriesLoading && categories.length === 0 && (
                <option value="">Chưa có danh mục nào</option>
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="form-error">{errors.categoryId}</p>}
            {!categoriesLoading && categories.length === 0 && (
              <p className="form-error">
                Chưa có danh mục nào. <Link to="/categories/new">Tạo danh mục mới</Link> trước.
              </p>
            )}
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
              {submitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
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
