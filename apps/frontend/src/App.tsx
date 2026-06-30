import { useEffect, useState } from 'react';
import './App.css';
import { ProductCard } from './components/ProductCard';
import type { Product } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = (await response.json()) as Product[];
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Smart WMS</p>
          <h1>Product Catalog</h1>
          <p>List of seeded products from the backend API.</p>
        </div>
        <a className="api-link" href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer">
          Swagger /api-docs
        </a>
      </header>

      <section className="products-panel">
        {loading && <p>Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
