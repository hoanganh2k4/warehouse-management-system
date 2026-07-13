import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardSummary } from '../types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function fetchSummary() {
      setLoading(true);

      dashboardService
        .getSummary()
        .then((result) => {
          if (cancelled) return;
          setSummary(result);
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

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function refetch() {
    setLoading(true);
    setReloadToken((t) => t + 1);
  }

  return { summary, loading, error, refetch };
}
