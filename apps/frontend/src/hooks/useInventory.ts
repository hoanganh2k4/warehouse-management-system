import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventory.service';
import type { GetInventoryParams, InventoryItem, PaginationMeta } from '../types';

export function useInventory(params: GetInventoryParams) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function fetchInventory() {
      setLoading(true);

      inventoryService
        .getInventory(params)
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
    }

    fetchInventory();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.warehouseId,
    params.zone,
    params.productId,
    params.sku,
    params.batchId,
    params.slotId,
    params.page,
    params.limit,
    reloadToken,
  ]);

  function refetch() {
    setLoading(true);
    setReloadToken((t) => t + 1);
  }

  return { items, meta, loading, error, refetch };
}
