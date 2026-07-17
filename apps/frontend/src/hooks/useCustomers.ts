import { useEffect, useState } from 'react';
import { customerService } from '../services/customer.service';
import type { Customer } from '../types';

export function useCustomers(enabled: boolean = true) {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    function fetchCustomers() {
      setLoading(true);
      customerService
        .getCustomers({ page: 1, limit: 100 })
        .then((result) => {
          if (!cancelled) setItems(result.items);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { items, loading };
}
