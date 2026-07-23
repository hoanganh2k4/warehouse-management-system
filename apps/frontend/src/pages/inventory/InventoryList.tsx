import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import { InventoryLedgerTable } from '../../components/InventoryLedgerTable';
import { InventoryTable } from '../../components/InventoryTable';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useInventoryLedger } from '../../hooks/useInventoryLedger';
import { productService } from '../../services/product.service';
import type { Product } from '../../types';

type InventoryTab = 'detail' | 'ledger';

export default function InventoryList() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('detail');

  const [skuInput, setSkuInput] = useState('');
  const [zoneInput, setZoneInput] = useState('');
  // Trì hoãn 400ms trước khi gọi API để tránh gọi liên tục khi đang gõ.
  const [sku, setSku] = useState('');
  const [zone, setZone] = useState('');
  const [page, setPage] = useState(1);

  const [ledgerProductIdFilter, setLedgerProductIdFilter] = useState('');
  const [ledgerFromFilter, setLedgerFromFilter] = useState('');
  const [ledgerToFilter, setLedgerToFilter] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setSku(skuInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [skuInput]);

  useEffect(() => {
    const timer = setTimeout(() => setZone(zoneInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [zoneInput]);

  useEffect(() => {
    let cancelled = false;
    productService
      .getProducts({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled) setProducts(result.items);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { items, meta, loading, error } = useInventory({
    page,
    limit: 20,
    sku: sku || undefined,
    zone: zone || undefined,
  });

  const {
    items: ledgerItems,
    meta: ledgerMeta,
    loading: ledgerLoading,
    error: ledgerError,
  } = useInventoryLedger({
    page: ledgerPage,
    limit: 20,
    productId: ledgerProductIdFilter || undefined,
    from: ledgerFromFilter || undefined,
    to: ledgerToFilter || undefined,
  });

  const totalCount = meta?.total ?? 0;
  const ledgerTotalCount = ledgerMeta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Tồn kho</h1>
          <p className="page-desc">
            Chi tiết tồn kho hiện tại theo lô hàng/vị trí, và sổ biến động nhập/xuất theo thời gian.
          </p>
        </div>

        <div className="page-header-controls">
          {activeTab === 'detail' ? (
            <>
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
                placeholder="Lọc theo Zone (VD: Z-A)"
                value={zoneInput}
                onChange={(event) => {
                  setZoneInput(event.target.value);
                  setPage(1);
                }}
                aria-label="Lọc theo Zone"
              />
            </>
          ) : (
            <>
              <select
                className="sort-select"
                value={ledgerProductIdFilter}
                disabled={productsLoading}
                onChange={(event) => {
                  setLedgerProductIdFilter(event.target.value);
                  setLedgerPage(1);
                }}
                aria-label="Lọc sổ biến động theo sản phẩm"
              >
                <option value="">
                  {productsLoading ? 'Đang tải sản phẩm...' : 'Tất cả sản phẩm'}
                </option>
                {!productsLoading &&
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.skuCode} — {product.name}
                    </option>
                  ))}
              </select>

              <div className="filter-field">
                <label className="filter-field-label" htmlFor="ledger-from-date">
                  Từ ngày
                </label>
                <input
                  id="ledger-from-date"
                  type="date"
                  className="filter-input"
                  value={ledgerFromFilter}
                  onChange={(event) => {
                    setLedgerFromFilter(event.target.value);
                    setLedgerPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label className="filter-field-label" htmlFor="ledger-to-date">
                  Đến ngày
                </label>
                <input
                  id="ledger-to-date"
                  type="date"
                  className="filter-input"
                  value={ledgerToFilter}
                  onChange={(event) => {
                    setLedgerToFilter(event.target.value);
                    setLedgerPage(1);
                  }}
                />
              </div>
            </>
          )}

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

      <nav
        className="tab-nav"
        aria-label="Chuyển đổi giữa chi tiết tồn kho và sổ biến động kho"
      >
        <button
          type="button"
          className={`tab-button ${activeTab === 'detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('detail')}
        >
          Chi tiết tồn kho
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          Sổ biến động kho
        </button>
      </nav>

      {activeTab === 'detail' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Chi tiết tồn kho</h2>
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
      )}

      {activeTab === 'ledger' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Sổ biến động kho</h2>
            {!ledgerLoading && !ledgerError && (
              <span className="result-count">
                {ledgerItems.length} of {ledgerTotalCount}
              </span>
            )}
          </div>

          <InventoryLedgerTable
            items={ledgerItems}
            totalCount={ledgerTotalCount}
            loading={ledgerLoading}
            error={ledgerError}
          />

          <div className="pagination-controls">
            <button
              disabled={ledgerLoading || ledgerPage <= 1}
              onClick={() => setLedgerPage((currentPage) => currentPage - 1)}
            >
              Trang trước
            </button>
            <span>
              Trang {ledgerPage} / {ledgerMeta?.totalPages ?? 1}
            </span>
            <button
              disabled={
                ledgerLoading || !ledgerMeta || ledgerPage >= ledgerMeta.totalPages
              }
              onClick={() => setLedgerPage((currentPage) => currentPage + 1)}
            >
              Trang sau
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
