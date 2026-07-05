import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { ProductTable } from './components/ProductTable';
import { StatCard } from './components/StatCard';
import { BoxIcon, LayersIcon, ScaleIcon, TagIcon } from './components/icons';
import type { Product } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TẠM THỜI: Topbar (chứa ô search) giờ do Layout.tsx render với query rỗng cố định,
  // nên state này chưa có ai cập nhật được nữa. Task 05 sẽ nối lại ô search thật.
  const [query] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const json = (await response.json()) as { success: boolean; data: { items: Product[] } };
        setProducts(json.data?.items ?? []);
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.skuCode.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    );
  }, [products, query]);

  const stats = useMemo(() => {
    const categories = new Set(products.map((p) => p.category));
    const units = new Set(products.map((p) => p.unit));
    const heavy = products.filter((p) => p.isHeavy).length;
    return {
      total: products.length,
      categories: categories.size,
      units: units.size,
      heavy,
    };
  }, [products]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route
          path="products"
          element={
            <main className="app-content">
              <div className="page-header">
                <div>
                  <p className="eyebrow">Catalog</p>
                  <h1>Products</h1>
                  <p className="page-desc">Every SKU seeded into the warehouse system, in one place.</p>
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
                      {filteredProducts.length} of {products.length}
                    </span>
                  )}
                </div>
                <ProductTable
                  products={filteredProducts}
                  totalCount={products.length}
                  loading={loading}
                  error={error}
                  query={query}
                />
              </section>
            </main>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
