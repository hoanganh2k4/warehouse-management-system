import { useEffect, useState } from 'react';
import { transactionService } from '../services/transaction.service';
import type { GetTransactionsParams, PaginationMeta, Transaction } from '../types';

const POLL_INTERVAL_MS = 15_000;



export function useTransactions(params: GetTransactionsParams) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function fetchTransactions(background = false) {
      if (!background) setLoading(true);

      transactionService
        .getTransactions(params)
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

    fetchTransactions();
    const intervalId = window.setInterval(() => fetchTransactions(true), POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.from,
    params.to,
    params.type,
    params.productId,
    params.warehouseId,
    params.orderCode,
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
