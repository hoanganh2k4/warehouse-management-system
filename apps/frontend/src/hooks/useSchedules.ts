import { useEffect, useState } from 'react';
import { scheduleService } from '../services/schedule.service';
import type { GetSchedulesParams, PaginationMeta, Schedule } from '../types';

const POLL_INTERVAL_MS = 15_000;



export function useSchedules(params: GetSchedulesParams, enabled: boolean) {
  const [items, setItems] = useState<Schedule[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    function fetchSchedules(background = false) {
      if (!background) setLoading(true);

      scheduleService
        .getSchedules(params)
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

    fetchSchedules();
    const intervalId = window.setInterval(() => fetchSchedules(true), POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, params.type, params.status, params.productId, params.page, params.limit, reloadToken]);

  function refetch() {
    setLoading(true);
    setReloadToken((t) => t + 1);
  }

  return { items, meta, loading, error, refetch };
}
