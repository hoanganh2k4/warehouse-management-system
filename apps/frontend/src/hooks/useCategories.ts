import { useEffect, useState } from 'react';
import { categoryService } from '../services/category.service';
import type { Category } from '../types';

export function useCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function fetchCategories() {
      setLoading(true);

      categoryService
        .getCategories()
        .then((result) => {
          if (cancelled) return;
          setItems(result);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { items, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}
