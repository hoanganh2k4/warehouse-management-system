import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { zoneService } from '../../services/zone.service';
import { rackService } from '../../services/rack.service';
import { levelService } from '../../services/level.service';
import { slotService } from '../../services/slot.service';
import { productService } from '../../services/product.service';
import { Toast } from '../../components/Toast';
import type { Zone, Rack, Level, Slot, Product } from '../../types';

type GridRow = { level: Level; slots: Slot[] };

type SlotStatus = 'empty' | 'partial' | 'full';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }
  return fallback;
}

function slotStatus(slot: Slot): SlotStatus {
  if (slot.occupancyRate <= 0) return 'empty';
  if (slot.occupancyRate >= 100) return 'full';
  return 'partial';
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export default function WarehouseMapPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [racks, setRacks] = useState<Rack[]>([]);
  const [racksLoading, setRacksLoading] = useState(false);
  const [racksError, setRacksError] = useState<string | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSlotProduct, setSelectedSlotProduct] = useState<Product | null>(null);
  const [selectedSlotProductLoading, setSelectedSlotProductLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theo dõi giá trị đã chọn ở lần render trước để reset/đánh dấu loading ngay
  // trong lúc render, thay vì gọi setState đồng bộ bên trong effect.
  const [prevZoneId, setPrevZoneId] = useState<string | null>(selectedZoneId);
  const [prevRackId, setPrevRackId] = useState<string | null>(selectedRackId);

  if (selectedZoneId !== prevZoneId) {
    setPrevZoneId(selectedZoneId);
    setSelectedRackId(null);
    setRacksLoading(selectedZoneId !== null);
    if (!selectedZoneId) {
      setRacks([]);
      setRacksError(null);
    }
  }

  if (selectedRackId !== prevRackId) {
    setPrevRackId(selectedRackId);
    setGridLoading(selectedRackId !== null);
    if (!selectedRackId) {
      setGridRows([]);
      setGridError(null);
    }
  }

  // Zones
  useEffect(() => {
    let cancelled = false;

    zoneService
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setZones(result);
        setZonesError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setZonesError(extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải danh sách Zone'));
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Racks — phụ thuộc Zone đang chọn
  useEffect(() => {
    if (!selectedZoneId) {
      return;
    }

    let cancelled = false;

    rackService
      .getAll(selectedZoneId)
      .then((result) => {
        if (cancelled) return;
        setRacks(result);
        setRacksError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRacksError(extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải danh sách Rack'));
      })
      .finally(() => {
        if (!cancelled) setRacksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedZoneId]);

  // Grid — tải toàn bộ Level + Slot của Rack đang chọn
  useEffect(() => {
    if (!selectedRackId) {
      return;
    }

    let cancelled = false;

    levelService
      .getAll(selectedRackId)
      .then(async (levels) => {
        const sortedLevels = [...levels].sort((a, b) => b.levelNumber - a.levelNumber);
        const slotsByLevel = await Promise.all(
          sortedLevels.map((level) => slotService.getAll({ levelId: level.id, limit: 200 })),
        );
        if (cancelled) return;
        setGridRows(
          sortedLevels.map((level, index) => ({ level, slots: slotsByLevel[index].items })),
        );
        setGridError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setGridError(extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải sơ đồ kho'));
      })
      .finally(() => {
        if (!cancelled) setGridLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRackId]);

  function openSlot(slot: Slot) {
    setSelectedSlot(slot);
    setSelectedSlotProduct(null);
    if (!slot.currentProductId) return;

    setSelectedSlotProductLoading(true);
    productService
      .getProductById(slot.currentProductId)
      .then((product) => setSelectedSlotProduct(product))
      .catch(() => setSelectedSlotProduct(null))
      .finally(() => setSelectedSlotProductLoading(false));
  }

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null;
  const selectedRack = racks.find((rack) => rack.id === selectedRackId) ?? null;
  const columns = Array.from(
    new Set(gridRows.flatMap((row) => row.slots.map((slot) => slot.code))),
  ).sort(naturalCompare);

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      {selectedSlot && (
        <div className="dialog-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="dialog-box warehouse-map-popup" onClick={(event) => event.stopPropagation()}>
            <h3 className="dialog-title">
              Slot {selectedSlot.code}
              {selectedZone && selectedRack ? ` — ${selectedZone.code} / ${selectedRack.code}` : ''}
            </h3>
            <dl className="warehouse-map-popup-list">
              <div>
                <dt>Sức chứa</dt>
                <dd>
                  {selectedSlot.usedCapacity} / {selectedSlot.maxCapacity}
                </dd>
              </div>
              <div>
                <dt>Độ lấp đầy</dt>
                <dd>{Math.round(selectedSlot.occupancyRate)}%</dd>
              </div>
              <div>
                <dt>Còn trống</dt>
                <dd>{selectedSlot.availableCapacity}</dd>
              </div>
              <div>
                <dt>Khoảng cách tới cổng</dt>
                <dd>{selectedSlot.distanceToGate} m</dd>
              </div>
              <div>
                <dt>Hàng hoá</dt>
                <dd>
                  {!selectedSlot.currentProductId && 'Trống'}
                  {selectedSlot.currentProductId &&
                    selectedSlotProductLoading &&
                    'Đang tải...'}
                  {selectedSlot.currentProductId &&
                    !selectedSlotProductLoading &&
                    selectedSlotProduct &&
                    `${selectedSlotProduct.skuCode} — ${selectedSlotProduct.name}`}
                  {selectedSlot.currentProductId &&
                    !selectedSlotProductLoading &&
                    !selectedSlotProduct &&
                    'Không tải được thông tin sản phẩm'}
                </dd>
              </div>
            </dl>
            <div className="dialog-actions">
              <button type="button" className="btn-secondary" onClick={() => setSelectedSlot(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Sơ đồ kho</h1>
          <p className="page-desc">
            Xem trạng thái lấp đầy của từng Slot theo dạng lưới trực quan cho một Rack cụ thể.
          </p>
        </div>
      </div>

      <section className="panel warehouse-map-controls">
        <div className="warehouse-map-select-group">
          <label htmlFor="wm-zone">Zone</label>
          <select
            id="wm-zone"
            className="sort-select"
            value={selectedZoneId ?? ''}
            disabled={zonesLoading || zones.length === 0}
            onChange={(event) => setSelectedZoneId(event.target.value || null)}
          >
            <option value="">{zonesLoading ? 'Đang tải...' : '-- Chọn Zone --'}</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.code}
              </option>
            ))}
          </select>
          {zonesError && <p className="field-error">{zonesError}</p>}
        </div>

        <div className="warehouse-map-select-group">
          <label htmlFor="wm-rack">Rack</label>
          <select
            id="wm-rack"
            className="sort-select"
            value={selectedRackId ?? ''}
            disabled={!selectedZoneId || racksLoading || racks.length === 0}
            onChange={(event) => setSelectedRackId(event.target.value || null)}
          >
            <option value="">
              {!selectedZoneId ? 'Chọn Zone trước' : racksLoading ? 'Đang tải...' : '-- Chọn Rack --'}
            </option>
            {racks.map((rack) => (
              <option key={rack.id} value={rack.id}>
                {rack.code}
              </option>
            ))}
          </select>
          {racksError && <p className="field-error">{racksError}</p>}
        </div>

        <ul className="warehouse-map-legend">
          <li>
            <span className="warehouse-map-legend-dot is-empty" /> Trống
          </li>
          <li>
            <span className="warehouse-map-legend-dot is-partial" /> Đang sử dụng
          </li>
          <li>
            <span className="warehouse-map-legend-dot is-full" /> Đầy
          </li>
        </ul>
      </section>

      <section className="panel warehouse-map-panel">
        {!selectedRackId && (
          <div className="racking-empty-state">
            <p>Chọn Zone và Rack để xem sơ đồ kho.</p>
          </div>
        )}

        {selectedRackId && gridLoading && (
          <div className="warehouse-map-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="skeleton" style={{ height: '40px' }} />
            ))}
          </div>
        )}

        {selectedRackId && !gridLoading && gridError && (
          <div className="racking-empty-state">
            <p>{gridError}</p>
          </div>
        )}

        {selectedRackId && !gridLoading && !gridError && gridRows.length === 0 && (
          <div className="racking-empty-state">
            <p>Rack này chưa có Level nào.</p>
          </div>
        )}

        {selectedRackId && !gridLoading && !gridError && gridRows.length > 0 && (
          <>
            <p className="warehouse-map-caption">
              {selectedZone?.code} – {selectedRack?.code}
            </p>
            <div className="warehouse-map-scroll">
              <div className="warehouse-map-grid">
                {gridRows.map(({ level, slots }) => {
                  const codeToSlot = new Map(slots.map((slot) => [slot.code, slot]));
                  return (
                    <div className="warehouse-map-row" key={level.id}>
                      <span className="warehouse-map-row-label">L{level.levelNumber}</span>
                      <div className="warehouse-map-cells">
                        {columns.map((code) => {
                          const slot = codeToSlot.get(code);
                          if (!slot) {
                            return (
                              <span
                                key={code}
                                className="warehouse-map-cell is-placeholder"
                                aria-hidden="true"
                              />
                            );
                          }
                          const status = slotStatus(slot);
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`warehouse-map-cell is-${status}`}
                              onClick={() => openSlot(slot)}
                              title={`${slot.code} — ${Math.round(slot.occupancyRate)}%`}
                              aria-label={`Slot ${slot.code}, ${Math.round(slot.occupancyRate)}% lấp đầy`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="warehouse-map-row warehouse-map-col-labels">
                  <span className="warehouse-map-row-label" aria-hidden="true" />
                  <div className="warehouse-map-cells">
                    {columns.map((code) => (
                      <span key={code} className="warehouse-map-cell-label">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}