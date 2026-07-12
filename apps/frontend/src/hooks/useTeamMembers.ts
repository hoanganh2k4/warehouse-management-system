import { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import type { GetTeamMembersParams, PaginationMeta, TeamMember } from '../types';

export function useTeamMembers(params: GetTeamMembersParams) {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchTeamMembers() {
      setLoading(true);
      try {
        const result = await userService.getTeamMembers(params);
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTeamMembers();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, reloadToken]);

  return { items, meta, loading, error, refetch: () => setReloadToken((t) => t + 1) };
}