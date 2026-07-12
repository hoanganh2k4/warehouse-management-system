import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import { ProductTable } from '../../components/ProductTable';
import { StatCard } from '../../components/StatCard';
import { BoxIcon, LayersIcon, ScaleIcon, SearchIcon, TagIcon } from '../../components/icons';
import { useProducts } from '../../hooks/useProducts';
import type { ProductSort } from '../../types';

export default function ProductList() {
  // inputValue: cập nhật ngay theo từng keystroke, bind vào ô input.
  // debouncedKeyword: cập nhật sau 350ms, dùng làm param gọi API (Task 17).
  const [inputValue, setInputValue] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProductSort>('name');

  // Tìm kiếm mới -> quay lại trang 1, tránh đứng ở trang không tồn tại (Task 17/18/19).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(inputValue);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { items, meta, loading, error, refetch } = useProducts({
    page,
    limit: 20,
    keyword: debouncedKeyword || undefined,
    sort,
  });
  // refetch chưa được dùng ở task này — sẽ dùng ở Task 38 (xoá sản phẩm xong thì gọi lại).
  // Giữ tham chiếu để tsconfig (noUnusedLocals) không báo lỗi trong lúc chờ Task 38.
  void refetch;

  const stats = useMemo(() => {
    const categories = new Set(items.map((p) => p.category.id));
    const units = new Set(items.map((p) => p.unit));
    const heavy = items.filter((p) => p.isHeavy).length;
    return {
      total: meta?.total ?? items.length,
      categories: categories.size,
      units: units.size,
      heavy,
    };
  }, [items, meta]);

  const totalCount = meta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
          <p className="page-desc">Every SKU seeded into the warehouse system, in one place.</p>
        </div>

        <div className="page-header-controls">
          <label className="topbar-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search by name or SKU..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              aria-label="Search products"
            />
          </label>

          <select
            className="sort-select"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as ProductSort);
              setPage(1);
            }}
            aria-label="Sort products"
          >
            <option value="name">Tên sản phẩm</option>
            <option value="sku">Mã SKU</option>
            <option value="category">Danh mục</option>
          </select>

          <Link to="/products/new" className="btn-primary">
            + Thêm sản phẩm
          </Link>
        </div>
      </div>

      <div className="stat-row">
        <StatCard
          label="Total SKUs"
          value={loading ? '—' : String(stats.total)}
          hint="Active products"
          icon={<BoxIcon />}
        />
        <StatCard
          label="Categories"
          value={loading ? '—' : String(stats.categories)}
          hint="Distinct groupings"
          icon={<TagIcon />}
        />
        <StatCard
          label="Units of measure"
          value={loading ? '—' : String(stats.units)}
          hint="Across the catalog"
          icon={<LayersIcon />}
        />
        <StatCard
          label="Heavy items"
          value={loading ? '—' : String(stats.heavy)}
          hint="Require special handling"
          icon={<ScaleIcon />}
        />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>All products</h2>
          {!loading && !error && (
            <span className="result-count">
              {items.length} of {totalCount}
            </span>
          )}
        </div>
        <ProductTable
          products={items}
          totalCount={totalCount}
          loading={loading}
          error={error}
          query={inputValue}
        />

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