import { useState } from 'react';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { TeamTable } from '../../components/TeamTable';

export default function TeamList() {
  const [page, setPage] = useState(1);
  const { items, meta, loading, error } = useTeamMembers({ page, limit: 20 });

  const totalCount = meta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Team</p>
          <h1>Nhân sự</h1>
          <p className="page-desc">Danh sách nhân viên trong hệ thống.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Tất cả nhân sự</h2>
          {!loading && !error && (
            <span className="result-count">
              {items.length} of {totalCount}
            </span>
          )}
        </div>

        <TeamTable members={items} totalCount={totalCount} loading={loading} error={error} />

        <div className="pagination-controls">
          <button disabled={loading || page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trang trước
          </button>
          <span>
            Trang {page} / {meta?.totalPages ?? 1}
          </span>
          <button
            disabled={loading || !meta || page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </button>
        </div>
      </section>
    </main>
  );
}