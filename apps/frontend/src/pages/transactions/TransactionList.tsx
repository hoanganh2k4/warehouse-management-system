import { useEffect, useState } from 'react';
import '../../App.css';
import { TransactionTable } from '../../components/TransactionTable';
import { useTransactions } from '../../hooks/useTransactions';
import { productService } from '../../services/product.service';
import type { Product, TransactionType } from '../../types';

export default function TransactionList() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

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

  const { items, meta, loading, error } = useTransactions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    from: fromFilter || undefined,
    to: toFilter || undefined,
    productId: productIdFilter || undefined,
  });

  const totalCount = meta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Lịch sử giao dịch</h1>
          <p className="page-desc">
            Nhật ký nhập/xuất/di chuyển hàng trong kho, được sinh tự động từ các thao tác kho.
          </p>
        </div>

        <div className="page-header-controls">
          <select
            className="sort-select"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as TransactionType | '');
              setPage(1);
            }}
            aria-label="Lọc theo loại giao dịch"
          >
            <option value="">Tất cả loại</option>
            <option value="IMPORT">Nhập kho</option>
            <option value="EXPORT">Xuất kho</option>
          </select>

          <select
            className="sort-select"
            value={productIdFilter}
            disabled={productsLoading}
            onChange={(event) => {
              setProductIdFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo sản phẩm"
          >
            <option value="">{productsLoading ? 'Đang tải sản phẩm...' : 'Tất cả sản phẩm'}</option>
            {!productsLoading &&
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.skuCode} — {product.name}
                </option>
              ))}
          </select>

          <div className="filter-field">
            <label className="filter-field-label" htmlFor="txn-from-date">
              Từ ngày
            </label>
            <input
              id="txn-from-date"
              type="date"
              className="filter-input"
              value={fromFilter}
              onChange={(event) => {
                setFromFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="filter-field">
            <label className="filter-field-label" htmlFor="txn-to-date">
              Đến ngày
            </label>
            <input
              id="txn-to-date"
              type="date"
              className="filter-input"
              value={toFilter}
              onChange={(event) => {
                setToFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Toàn bộ giao dịch</h2>
          {!loading && !error && (
            <span className="result-count">
              {items.length} of {totalCount}
            </span>
          )}
        </div>

        <TransactionTable items={items} totalCount={totalCount} loading={loading} error={error} />

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
