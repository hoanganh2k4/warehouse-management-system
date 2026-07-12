import { useParams, Link } from 'react-router-dom';

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();

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
      {/* Form thật sẽ thêm ở Task 34/35/36 */}
    </main>
  );
}
