import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { categoryService } from '../../services/category.service';
import { Toast } from '../../components/Toast';

type CategoryFormState = {
  name: string;
  description: string;
};

type FormErrors = Partial<Record<keyof CategoryFormState, string>>;

export default function CategoryCreate() {
  const [form, setForm] = useState<CategoryFormState>({ name: '', description: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  function updateField<K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) {
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
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên danh mục';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await categoryService.createCategory({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      navigate('/categories');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Tên danh mục này đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        setToastMessage('Không thể tạo danh mục. Vui lòng thử lại.');
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
          <p className="eyebrow">Catalog</p>
          <h1>Thêm danh mục mới</h1>
          <p className="page-desc">Danh mục dùng để phân loại sản phẩm trong kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin danh mục</h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Tên danh mục
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="ví dụ: MILK, CRACKER"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Mô tả (không bắt buộc)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="form-input"
              placeholder="ví dụ: Sữa"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo danh mục'}
            </button>
            <Link to="/categories" className="btn-secondary">
              Huỷ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
