import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardChartPoint } from '../types';

export function useDashboardChart(days = 14) {
  const [data, setData] = useState<DashboardChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    dashboardService
      .getChart(days)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days, reloadToken]);

  function refetch() {
    setReloadToken((t) => t + 1);
  }

  return { data, loading, error, refetch };
}
