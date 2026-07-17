import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ScaleIcon } from '../../components/icons';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { productService } from '../../services/product.service';

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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProductDetail(id);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
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
          <p className="state-title">Không tải được chi tiết sản phẩm</p>
          <p className="state-body">{error}</p>
          <button onClick={refetch}>Thử lại</button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="app-content">
        <div className="state-panel">
          <p className="state-title">Không tìm thấy sản phẩm</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <Link to="/products" className="back-link">
            ← Quay lại danh sách
          </Link>
          <p className="eyebrow">Danh mục</p>
          <h1>{product.name}</h1>
          <p className="page-desc">
            <span className="sku-code">{product.skuCode}</span>
          </p>
        </div>

        <div className="table-actions">
          <Link to={`/products/${product.id}/edit`} className="btn-primary">
            Sửa
          </Link>
          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            Xoá
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Xoá sản phẩm"
        message={`Bạn có chắc muốn xoá "${product.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin sản phẩm</h2>
        </div>

        <div className="table-wrap">
          <table className="product-table">
            <tbody>
              <tr>
                <td className="muted-cell">Danh mục</td>
                <td>
                  <span className="chip">{product.category.name}</span>
                </td>
              </tr>
              <tr>
                <td className="muted-cell">Đơn vị</td>
                <td className="unit-cell">{product.unit}</td>
              </tr>
              <tr>
                <td className="muted-cell">Xử lý</td>
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
              </tr>
              <tr>
                <td className="muted-cell">Ngày tạo</td>
                <td className="muted-cell">{formatDate(product.createdAt)}</td>
              </tr>
              <tr>
                <td className="muted-cell">Cập nhật lần cuối</td>
                <td className="muted-cell">{formatDate(product.updatedAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lô hàng (Batches)</h2>
          <span className="result-count">{product.batches.length} lô</span>
        </div>

        {product.batches.length === 0 ? (
          <div className="state-panel">
            <p className="state-title">Chưa có lô hàng nào</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Mã lô</th>
                  <th>Ngày sản xuất</th>
                  <th>Ngày hết hạn</th>
                </tr>
              </thead>
              <tbody>
                {product.batches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="sku-code">{batch.batchCode}</td>
                    <td className="muted-cell">{formatDate(batch.manufactureDate)}</td>
                    <td className="muted-cell">{formatDate(batch.expiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
