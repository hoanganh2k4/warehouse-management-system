import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardChartPoint } from '../types';

const POLL_INTERVAL_MS = 15_000;

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

    function fetchChart(background = false) {
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
          if (!cancelled && !background) setResolvedKey(requestKey);
        });
    }

    fetchChart();
    const intervalId = window.setInterval(() => fetchChart(true), POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      cancelled = true;
    };
  }, [days, reloadToken, requestKey]);

  function refetch() {
    setReloadToken((t) => t + 1);
  }

  return { data, loading, error, refetch };
}
