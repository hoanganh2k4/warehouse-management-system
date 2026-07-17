import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { CategoryTable } from '../../components/CategoryTable';
import { StatCard } from '../../components/StatCard';
import { BoxIcon, TagIcon } from '../../components/icons';
import { useCategories } from '../../hooks/useCategories';
import { categoryService } from '../../services/category.service';
import { Toast } from '../../components/Toast';
import type { Category } from '../../types';

export default function CategoryList() {
  const { items, loading, error, refetch } = useCategories();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');

  const totalProducts = items.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Xoá danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      await categoryService.deleteCategory(category.id);
      setToastType('success');
      setToastMessage(`Đã xoá danh mục "${category.name}".`);
      refetch();
    } catch (err) {
      setToastType('error');
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Không thể xoá: danh mục này vẫn đang được sản phẩm sử dụng.');
      } else {
        setToastMessage('Không thể xoá danh mục. Vui lòng thử lại.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Danh mục</p>
          <h1>Danh mục sản phẩm</h1>
          <p className="page-desc">Quản lý danh mục sản phẩm dùng trong toàn bộ kho.</p>
        </div>

        <div className="page-header-controls">
          <Link to="/categories/new" className="btn-primary">
            + Thêm danh mục
          </Link>
        </div>
      </div>

      <div className="stat-row">
        <StatCard
          label="Tổng số danh mục"
          value={loading ? '—' : String(items.length)}
          hint="Danh mục đang có"
          icon={<TagIcon />}
        />
        <StatCard
          label="Sản phẩm đã gán"
          value={loading ? '—' : String(totalProducts)}
          hint="Tổng số sản phẩm đã gán danh mục"
          icon={<BoxIcon />}
        />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Tất cả danh mục</h2>
          {!loading && !error && <span className="result-count">{items.length} danh mục</span>}
        </div>
        <CategoryTable
          categories={items}
          loading={loading}
          error={error}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}
