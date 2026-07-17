import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { AlertIcon, TagIcon } from './icons';

type CategoryTableProps = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onDelete: (category: Category) => void;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

export function CategoryTable({
  categories,
  loading,
  error,
  deletingId,
  onDelete,
}: CategoryTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Số sản phẩm</th>
              <th>Cập nhật</th>
              <th aria-label="Hành động" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '120px' }} /></td>
                <td><span className="skeleton" style={{ width: '180px' }} /></td>
                <td><span className="skeleton" style={{ width: '50px' }} /></td>
                <td><span className="skeleton" style={{ width: '90px' }} /></td>
                <td><span className="skeleton" style={{ width: '90px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-error">
        <AlertIcon size={22} />
        <p className="state-title">Không tải được danh mục</p>
        <p className="state-body">{error}. Kiểm tra lại API và thử lại.</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="state-panel">
        <TagIcon size={22} />
        <p className="state-title">Chưa có danh mục nào</p>
        <p className="state-body">Thêm danh mục đầu tiên để bắt đầu phân loại sản phẩm.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Số sản phẩm</th>
            <th>Cập nhật</th>
            <th aria-label="Hành động" />
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="product-name">
                <span className="chip">{category.name}</span>
              </td>
              <td className="muted-cell">{category.description || '—'}</td>
              <td className="unit-cell">{category._count?.products ?? 0}</td>
              <td className="muted-cell">{formatDate(category.updatedAt)}</td>
              <td>
                <div className="table-actions">
                  <Link to={`/categories/${category.id}/edit`} className="btn-secondary btn-sm">
                    Sửa
                  </Link>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    disabled={deletingId === category.id}
                    onClick={() => onDelete(category)}
                  >
                    {deletingId === category.id ? 'Đang xoá...' : 'Xoá'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
