import { useEffect, useState } from 'react';
import { zoneService } from '../../services/zone.service';
import { WarehouseIcon } from '../../components/icons';
import type { Zone } from '../../types';

export default function RackingPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    zoneService
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setZones(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải danh sách Zone');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Racking</h1>
          <p className="page-desc">Sơ đồ vị trí lưu trữ: Zone → Rack → Level → Slot.</p>
        </div>
      </div>

      <div className="racking-columns">
        <section className="panel racking-column">
          <div className="panel-header">
            <h2>Zones</h2>
            {!loading && !error && <span className="result-count">{zones.length} zone</span>}
          </div>

          {loading && (
            <ul className="racking-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="racking-list-item skeleton-row">
                  <span className="skeleton" style={{ width: '120px' }} />
                </li>
              ))}
            </ul>
          )}

          {!loading && error && (
            <div className="racking-empty-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && zones.length === 0 && (
            <div className="racking-empty-state">
              <p>Chưa có Zone nào.</p>
            </div>
          )}

          {!loading && !error && zones.length > 0 && (
            <ul className="racking-list">
              {zones.map((zone) => (
                <li key={zone.id}>
                  <button
                    type="button"
                    className={`racking-list-item${
                      selectedZoneId === zone.id ? ' is-active' : ''
                    }`}
                    onClick={() => setSelectedZoneId(zone.id)}
                  >
                    <span className="racking-list-item-icon">
                      <WarehouseIcon size={16} />
                    </span>
                    <span className="racking-list-item-label">{zone.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cột Rack/Level/Slot sẽ được thêm ở Task 63/64/65 */}
      </div>
    </main>
  );
}
