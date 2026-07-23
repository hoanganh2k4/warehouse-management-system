import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventory.service';
import type {
  GetInventoryLedgerParams,
  InventoryLedgerItem,
  PaginationMeta,
} from '../types';

const POLL_INTERVAL_MS = 15_000;



export function useInventoryLedger(params: GetInventoryLedgerParams) {
  const [items, setItems] = useState<InventoryLedgerItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function fetchInventoryLedger(background = false) {
      if (!background) setLoading(true);

      inventoryService
        .getLedger(params)
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

    fetchInventoryLedger();
    const intervalId = window.setInterval(() => fetchInventoryLedger(true), POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.productId,
    params.slotId,
    params.from,
    params.to,
    params.page,
    params.limit,
    reloadToken,
  ]);

  function refetch() {
    setLoading(true);
    setReloadToken((token) => token + 1);
  }

  return { items, meta, loading, error, refetch };
}
