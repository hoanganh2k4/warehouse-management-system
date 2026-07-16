import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import { InventoryTable } from '../../components/InventoryTable';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';

export default function InventoryList() {
  const [skuInput, setSkuInput] = useState('');
  const [warehouseNameInput, setWarehouseNameInput] = useState('');
  // Trì hoãn 400ms trước khi gọi API để tránh gọi liên tục khi đang gõ.
  const [sku, setSku] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setSku(skuInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [skuInput]);

  useEffect(() => {
    const timer = setTimeout(() => setWarehouseName(warehouseNameInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [warehouseNameInput]);

  const { items, meta, loading, error } = useInventory({
    page,
    limit: 20,
    sku: sku || undefined,
    warehouseName: warehouseName || undefined,
  });

  const totalCount = meta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Tồn kho</h1>
          <p className="page-desc">Số lượng tồn theo lô hàng và vị trí trong kho.</p>
        </div>

        <div className="page-header-controls">
          <input
            type="text"
            className="filter-input"
            placeholder="Lọc theo mã sản phẩm"
            value={skuInput}
            onChange={(event) => {
              setSkuInput(event.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo mã sản phẩm"
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Lọc theo tên kho"
            value={warehouseNameInput}
            onChange={(event) => {
              setWarehouseNameInput(event.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo tên kho"
          />

          {isAuthenticated() ? (
            <>
              <Link to="/inventory/inbound" className="btn-primary">
                Nhập kho
              </Link>
              <Link to="/inventory/outbound" className="btn-secondary">
                Xuất kho
              </Link>
            </>
          ) : (
            <span className="page-desc">Đăng nhập để nhập/xuất kho</span>
          )}
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Toàn bộ tồn kho</h2>
          {!loading && !error && (
            <span className="result-count">
              {items.length} of {totalCount}
            </span>
          )}
        </div>

        <InventoryTable items={items} totalCount={totalCount} loading={loading} error={error} />

        <div className="pagination-controls">
          <button disabled={loading || page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trang trước
          </button>
          <span>
            Trang {page} / {meta?.totalPages ?? 1}
          </span>
          <button
            disabled={loading || !meta || page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </button>
        </div>
      </section>
    </main>
  );
}