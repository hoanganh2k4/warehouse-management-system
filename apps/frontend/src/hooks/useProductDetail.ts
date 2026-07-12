import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { ProductDetail } from '../types';

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await productService.getProductById(id as string);
        if (cancelled) return;
        setProduct(result);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const refetch = () => setReloadToken((t) => t + 1);

  if (!id) {
    return { product: null, loading: false, error: 'Thiếu id sản phẩm', refetch };
  }

  return { product, loading, error, refetch };
}