import { useEffect, useState } from 'react';
import { zoneService } from '../../services/zone.service';
import { rackService } from '../../services/rack.service';
import { levelService } from '../../services/level.service';
import { slotService } from '../../services/slot.service';
import { WarehouseIcon, LayersIcon, GridIcon, BoxIcon } from '../../components/icons';
import type { Zone, Rack, Level, Slot, PaginationMeta } from '../../types';

export default function RackingPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [racks, setRacks] = useState<Rack[]>([]);
  const [racksLoading, setRacksLoading] = useState(false);
  const [racksError, setRacksError] = useState<string | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  const [levels, setLevels] = useState<Level[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [levelsError, setLevelsError] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsMeta, setSlotsMeta] = useState<PaginationMeta | null>(null);
  const [slotsPage, setSlotsPage] = useState(1);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Cột Zone
  useEffect(() => {
    let cancelled = false;

    setZonesLoading(true);
    zoneService
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setZones(result);
        setZonesError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setZonesError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải danh sách Zone');
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Cột Rack — phụ thuộc Zone đang chọn
  useEffect(() => {
    setSelectedRackId(null);

    if (!selectedZoneId) {
      setRacks([]);
      setRacksError(null);
      return;
    }

    let cancelled = false;

    setRacksLoading(true);
    rackService
      .getAll(selectedZoneId)
      .then((result) => {
        if (cancelled) return;
        setRacks(result);
        setRacksError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRacksError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải danh sách Rack');
      })
      .finally(() => {
        if (!cancelled) setRacksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedZoneId]);

  // Cột Level — phụ thuộc Rack đang chọn
  useEffect(() => {
    setSelectedLevelId(null);

    if (!selectedRackId) {
      setLevels([]);
      setLevelsError(null);
      return;
    }

    let cancelled = false;

    setLevelsLoading(true);
    levelService
      .getAll(selectedRackId)
      .then((result) => {
        if (cancelled) return;
        setLevels(result);
        setLevelsError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLevelsError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải danh sách Level');
      })
      .finally(() => {
        if (!cancelled) setLevelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRackId]);

  // Reset trang + slot đang chọn mỗi khi đổi Level
  useEffect(() => {
    setSelectedSlotId(null);
    setSlotsPage(1);
  }, [selectedLevelId]);

  // Cột Slot — phụ thuộc Level đang chọn (và trang hiện tại)
  useEffect(() => {
    if (!selectedLevelId) {
      setSlots([]);
      setSlotsMeta(null);
      setSlotsError(null);
      return;
    }

    let cancelled = false;

    setSlotsLoading(true);
    slotService
      .getAll({ levelId: selectedLevelId, page: slotsPage, limit: 50 })
      .then((result) => {
        if (cancelled) return;
        setSlots(result.items);
        setSlotsMeta(result.meta);
        setSlotsError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotsError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải danh sách Slot');
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedLevelId, slotsPage]);

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
            {!zonesLoading && !zonesError && (
              <span className="result-count">{zones.length} zone</span>
            )}
          </div>

          {zonesLoading && (
            <ul className="racking-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="racking-list-item skeleton-row">
                  <span className="skeleton" style={{ width: '120px' }} />
                </li>
              ))}
            </ul>
          )}

          {!zonesLoading && zonesError && (
            <div className="racking-empty-state">
              <p>{zonesError}</p>
            </div>
          )}

          {!zonesLoading && !zonesError && zones.length === 0 && (
            <div className="racking-empty-state">
              <p>Chưa có Zone nào.</p>
            </div>
          )}

          {!zonesLoading && !zonesError && zones.length > 0 && (
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

        <section className="panel racking-column">
          <div className="panel-header">
            <h2>Racks</h2>
            {!racksLoading && !racksError && selectedZoneId && (
              <span className="result-count">{racks.length} rack</span>
            )}
          </div>

          {!selectedZoneId && (
            <div className="racking-empty-state">
              <p>Chọn Zone để xem Rack.</p>
            </div>
          )}

          {selectedZoneId && racksLoading && (
            <ul className="racking-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="racking-list-item skeleton-row">
                  <span className="skeleton" style={{ width: '120px' }} />
                </li>
              ))}
            </ul>
          )}

          {selectedZoneId && !racksLoading && racksError && (
            <div className="racking-empty-state">
              <p>{racksError}</p>
            </div>
          )}

          {selectedZoneId && !racksLoading && !racksError && racks.length === 0 && (
            <div className="racking-empty-state">
              <p>Chưa có dữ liệu.</p>
            </div>
          )}

          {selectedZoneId && !racksLoading && !racksError && racks.length > 0 && (
            <ul className="racking-list">
              {racks.map((rack) => (
                <li key={rack.id}>
                  <button
                    type="button"
                    className={`racking-list-item${
                      selectedRackId === rack.id ? ' is-active' : ''
                    }`}
                    onClick={() => setSelectedRackId(rack.id)}
                  >
                    <span className="racking-list-item-icon">
                      <LayersIcon size={16} />
                    </span>
                    <span className="racking-list-item-label">{rack.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel racking-column">
          <div className="panel-header">
            <h2>Levels</h2>
            {!levelsLoading && !levelsError && selectedRackId && (
              <span className="result-count">{levels.length} level</span>
            )}
          </div>

          {!selectedRackId && (
            <div className="racking-empty-state">
              <p>Chọn Rack để xem Level.</p>
            </div>
          )}

          {selectedRackId && levelsLoading && (
            <ul className="racking-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="racking-list-item skeleton-row">
                  <span className="skeleton" style={{ width: '120px' }} />
                </li>
              ))}
            </ul>
          )}

          {selectedRackId && !levelsLoading && levelsError && (
            <div className="racking-empty-state">
              <p>{levelsError}</p>
            </div>
          )}

          {selectedRackId && !levelsLoading && !levelsError && levels.length === 0 && (
            <div className="racking-empty-state">
              <p>Chưa có dữ liệu.</p>
            </div>
          )}

          {selectedRackId && !levelsLoading && !levelsError && levels.length > 0 && (
            <ul className="racking-list">
              {levels.map((level) => (
                <li key={level.id}>
                  <button
                    type="button"
                    className={`racking-list-item${
                      selectedLevelId === level.id ? ' is-active' : ''
                    }`}
                    onClick={() => setSelectedLevelId(level.id)}
                  >
                    <span className="racking-list-item-icon">
                      <GridIcon size={16} />
                    </span>
                    <span className="racking-list-item-label">Tầng {level.levelNumber}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel racking-column">
          <div className="panel-header">
            <h2>Slots</h2>
            {!slotsLoading && !slotsError && selectedLevelId && slotsMeta && (
              <span className="result-count">{slotsMeta.total} slot</span>
            )}
          </div>

          {!selectedLevelId && (
            <div className="racking-empty-state">
              <p>Chọn Level để xem Slot.</p>
            </div>
          )}

          {selectedLevelId && slotsLoading && (
            <ul className="racking-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="racking-list-item skeleton-row">
                  <span className="skeleton" style={{ width: '120px' }} />
                </li>
              ))}
            </ul>
          )}

          {selectedLevelId && !slotsLoading && slotsError && (
            <div className="racking-empty-state">
              <p>{slotsError}</p>
            </div>
          )}

          {selectedLevelId && !slotsLoading && !slotsError && slots.length === 0 && (
            <div className="racking-empty-state">
              <p>Chưa có Slot nào.</p>
            </div>
          )}

          {selectedLevelId && !slotsLoading && !slotsError && slots.length > 0 && (
            <>
              <ul className="racking-list">
                {slots.map((slot) => {
                  const hasSpace = slot.usedCapacity < slot.maxCapacity;
                  return (
                    <li key={slot.id}>
                      <button
                        type="button"
                        className={`racking-list-item${
                          selectedSlotId === slot.id ? ' is-active' : ''
                        }`}
                        onClick={() => setSelectedSlotId(slot.id)}
                      >
                        <span className="racking-list-item-icon">
                          <BoxIcon size={16} />
                        </span>
                        <span className="racking-list-item-label">{slot.code}</span>
                        <span
                          className={`badge ${hasSpace ? 'badge-success' : 'badge-danger'}`}
                        >
                          {hasSpace ? 'Còn chỗ' : 'Đầy'}
                        </span>
                        <span className="racking-list-item-sub">
                          {Math.round(slot.occupancyRate)}%
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {slotsMeta && slotsMeta.totalPages > 1 && (
                <div className="racking-pagination">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={slotsPage <= 1}
                    onClick={() => setSlotsPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </button>
                  <span>
                    Trang {slotsMeta.page}/{slotsMeta.totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={slotsPage >= slotsMeta.totalPages}
                    onClick={() => setSlotsPage((p) => Math.min(slotsMeta.totalPages, p + 1))}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
