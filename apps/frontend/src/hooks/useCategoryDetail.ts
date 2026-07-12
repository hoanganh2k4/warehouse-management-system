import { useEffect, useState } from 'react';
import { categoryService } from '../services/category.service';
import type { Category } from '../types';

export function useCategoryDetail(id: string | undefined) {
  const [category, setCategory] = useState<Category | null>(null);
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
        const result = await categoryService.getCategoryById(id as string);
        if (cancelled) return;
        setCategory(result);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        setCategory(null);
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
    return { category: null, loading: false, error: 'Thiếu id danh mục', refetch };
  }

  return { category, loading, error, refetch };
}
