import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { GetProductsParams, PaginationMeta, Product } from '../types';

// Khoảng thời gian giữa các lần tự động gọi lại API (mili-giây).
// Giữ đúng hành vi polling của bản ProductList.tsx gốc (trước Task 16).
const POLL_INTERVAL_MS = 10_000;

export function useProducts(params: GetProductsParams) {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // isBackgroundRefresh = true: gọi lại từ polling, không bật lại "loading"
    // để tránh giao diện bị nhấp nháy mỗi POLL_INTERVAL_MS.
    const fetchProducts = (isBackgroundRefresh = false) => {
      if (!isBackgroundRefresh) setLoading(true);

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
          if (!cancelled && !isBackgroundRefresh) setLoading(false);
        });
    };

    fetchProducts();
    const intervalId = setInterval(() => fetchProducts(true), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.keyword, params.sort, reloadToken]);

  return { items, meta, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}