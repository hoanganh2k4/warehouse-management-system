import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { AlertIcon, ScaleIcon, TagIcon } from './icons';

type ProductTableProps = {
  products: Product[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  query: string;
  onDeleteRequest: (product: Product) => void;
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

export function ProductTable({
  products,
  totalCount,
  loading,
  error,
  query,
  onDeleteRequest,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Đơn vị</th>
              <th>Xử lý</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '70px' }} /></td>
                <td><span className="skeleton" style={{ width: '160px' }} /></td>
                <td><span className="skeleton" style={{ width: '90px' }} /></td>
                <td><span className="skeleton" style={{ width: '50px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
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
        <p className="state-title">Không tải được danh mục sản phẩm</p>
        <p className="state-body">{error}. Kiểm tra API đã chạy chưa rồi thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <TagIcon size={22} />
        <p className="state-title">Chưa có sản phẩm nào</p>
        <p className="state-body">Sản phẩm sẽ hiển thị ở đây sau khi được thêm vào hệ thống.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="state-panel">
        <TagIcon size={22} />
        <p className="state-title">Không tìm thấy kết quả cho "{query}"</p>
        <p className="state-body">Thử tên khác, SKU khác hoặc danh mục khác.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Sản phẩm</th>
            <th>Danh mục</th>
            <th>Đơn vị</th>
            <th>Xử lý</th>
            <th>Cập nhật</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <span className="sku-code">{product.skuCode}</span>
              </td>
              <td className="product-name">{product.name}</td>
              <td>
                <span className="chip">{product.category.name}</span>
              </td>
              <td className="unit-cell">{product.unit}</td>
              <td>
                {product.isHeavy ? (
                  <span className="badge badge-heavy">
                    <ScaleIcon size={13} />
                    Hàng nặng
                  </span>
                ) : (
                  <span className="badge badge-standard">Tiêu chuẩn</span>
                )}
              </td>
              <td className="muted-cell">{formatDate(product.updatedAt)}</td>
              <td className="table-actions">
                <Link to={`/products/${product.id}`} className="btn-secondary btn-sm">
                  Xem
                </Link>
                <button className="btn-danger btn-sm" onClick={() => onDeleteRequest(product)}>
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
