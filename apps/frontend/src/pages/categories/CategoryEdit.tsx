import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useCategoryDetail } from '../../hooks/useCategoryDetail';
import { categoryService } from '../../services/category.service';
import { Toast } from '../../components/Toast';

type EditFormState = {
  name: string;
  description: string;
};

type EditFormErrors = Partial<Record<keyof EditFormState, string>>;

export default function CategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const { category, loading, error, refetch } = useCategoryDetail(id);

  const [form, setForm] = useState<EditFormState | null>(null);
  const [formInitializedFor, setFormInitializedFor] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Chỉ khởi tạo form 1 lần khi category load xong, giống pattern ProductEdit.
  if (category && formInitializedFor !== id) {
    setForm({ name: category.name, description: category.description ?? '' });
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
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên danh mục';
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
      await categoryService.updateCategory(id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      navigate('/categories');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setToastMessage('Danh mục không còn tồn tại (có thể đã bị xoá).');
      } else if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Tên danh mục này đã tồn tại. Vui lòng chọn tên khác.');
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
          <p className="state-title">Không tải được thông tin danh mục</p>
          <p className="state-body">{error}</p>
          <button onClick={refetch}>Thử lại</button>
        </div>
      </main>
    );
  }

  if (!category || !form) {
    return null;
  }

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      <div className="page-header">
        <div>
          <Link to="/categories" className="back-link">
            ← Quay lại danh sách
          </Link>
          <p className="eyebrow">Catalog</p>
          <h1>Sửa danh mục</h1>
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
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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
