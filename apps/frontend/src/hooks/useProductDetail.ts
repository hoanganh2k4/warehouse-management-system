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
      setProduct(null);
      setLoading(false);
      setError('Thiếu id sản phẩm');
      return;
    }

    let cancelled = false;
    setLoading(true);

    productService
      .getProductById(id)
      .then((result) => {
        if (cancelled) return;
        setProduct(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  return { product, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}
