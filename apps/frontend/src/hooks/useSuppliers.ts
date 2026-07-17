import { useEffect, useState } from 'react';
import { supplierService } from '../services/supplier.service';
import type { Supplier } from '../types';

export function useSuppliers(enabled: boolean = true) {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    function fetchSuppliers() {
      setLoading(true);
      supplierService
        .getSuppliers({ page: 1, limit: 100 })
        .then((result) => {
          if (!cancelled) setItems(result.items);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchSuppliers();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { items, loading };
}
