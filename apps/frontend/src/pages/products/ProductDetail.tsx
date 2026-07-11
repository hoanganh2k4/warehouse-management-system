import { useParams, Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <Link to="/products" className="back-link">
            ← Quay lại danh sách
          </Link>
          <p className="eyebrow">Catalog</p>
          <h1>Chi tiết sản phẩm</h1>
          <p className="page-desc">ID: {id}</p>
        </div>
      </div>
      {/* Nội dung chi tiết thật sẽ thêm ở Task 26 */}
    </main>
  );
}
