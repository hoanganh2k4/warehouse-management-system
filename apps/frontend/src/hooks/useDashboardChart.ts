import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardChartPoint } from '../types';

export function useDashboardChart(days = 14) {
  const [data, setData] = useState<DashboardChartPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  // Đánh dấu key của lần fetch đã hoàn thành gần nhất, dùng để "suy ra" loading
  // thay vì gọi setLoading(true) đồng bộ trong effect (tránh cascading renders).
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const requestKey = `${days}-${reloadToken}`;
  const loading = requestKey !== resolvedKey;

  useEffect(() => {
    let cancelled = false;

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
        if (!cancelled) setResolvedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [days, reloadToken, requestKey]);

  function refetch() {
    setReloadToken((t) => t + 1);
  }

  return { data, loading, error, refetch };
}
