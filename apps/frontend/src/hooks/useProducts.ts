import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { GetProductsParams, PaginationMeta, Product } from '../types';

export function useProducts(params: GetProductsParams) {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    productService
      .getProducts(params)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.keyword, params.sort, reloadToken]);

  return { items, meta, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}
