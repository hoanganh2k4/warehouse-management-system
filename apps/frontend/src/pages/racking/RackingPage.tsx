import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { zoneService } from '../../services/zone.service';
import { rackService } from '../../services/rack.service';
import { levelService } from '../../services/level.service';
import { slotService } from '../../services/slot.service';
import { productService } from '../../services/product.service';
import { WarehouseIcon, LayersIcon } from '../../components/icons';
import { ZoneFormModal } from '../../components/ZoneFormModal';
import { RackFormModal } from '../../components/RackFormModal';
import { LevelFormModal } from '../../components/LevelFormModal';
import { SlotFormModal } from '../../components/SlotFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import type {
  Zone,
  Rack,
  Level,
  Slot,
  Product,
  CreateZonePayload,
  UpdateZonePayload,
  CreateRackPayload,
  UpdateRackPayload,
  CreateLevelPayload,
  UpdateLevelPayload,
  CreateSlotPayload,
  UpdateSlotPayload,
} from '../../types';

type DeleteTarget =
  | { type: 'zone'; id: string; label: string }
  | { type: 'rack'; id: string; label: string; zoneId: string }
  | { type: 'level'; id: string; label: string }
  | { type: 'slot'; id: string; label: string };

type RackBucket = { items: Rack[]; loading: boolean; error: string | null; loaded: boolean };

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

export default function RackingPage() {
  // ---- Cây Zone / Rack (bên trái) ----
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [racksByZone, setRacksByZone] = useState<Record<string, RackBucket>>({});

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  // ---- Grid map (bên phải) ----
  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);

  // ---- Modal CRUD ----
  const [zoneModal, setZoneModal] = useState<{ mode: 'create' | 'edit'; zone?: Zone } | null>(
    null,
  );
  const [rackModal, setRackModal] = useState<{
    mode: 'create' | 'edit';
    rack?: Rack;
    zoneId: string;
  } | null>(null);
  const [levelModal, setLevelModal] = useState<{ mode: 'create' | 'edit'; level?: Level } | null>(
    null,
  );
  const [slotModal, setSlotModal] = useState<{
    mode: 'create' | 'edit';
    slot?: Slot;
    levelId: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ---- Popup chi tiết Slot ----
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSlotProduct, setSelectedSlotProduct] = useState<Product | null>(null);
  const [selectedSlotProductLoading, setSelectedSlotProductLoading] = useState(false);

  // Menu "..." hành động cho từng Level trong grid
  const [openLevelMenuId, setOpenLevelMenuId] = useState<string | null>(null);

  // Theo dõi Rack đang chọn ở lần render trước để đánh dấu loading ngay trong
  // lúc render (theo khuyến nghị của React thay vì setState trong effect).
  const [prevRackId, setPrevRackId] = useState<string | null>(selectedRackId);
  if (selectedRackId !== prevRackId) {
    setPrevRackId(selectedRackId);
    setGridLoading(selectedRackId !== null);
    if (!selectedRackId) {
      setGridRows([]);
      setGridError(null);
    }
  }

  function loadZones() {
    setZonesLoading(true);
    return zoneService
      .getAll()
      .then((result) => {
        setZones(result);
        setZonesError(null);
      })
      .catch((err) => {
        setZonesError(extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải danh sách Zone'));
      })
      .finally(() => {
        setZonesLoading(false);
      });
  }

  // Zones — chỉ tải một lần khi mount
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

  function loadRacksForZone(zoneId: string) {
    setRacksByZone((prev) => ({
      ...prev,
      [zoneId]: { items: prev[zoneId]?.items ?? [], loading: true, error: null, loaded: false },
    }));
    return rackService
      .getAll(zoneId)
      .then((items) => {
        setRacksByZone((prev) => ({
          ...prev,
          [zoneId]: { items, loading: false, error: null, loaded: true },
        }));
      })
      .catch((err) => {
        setRacksByZone((prev) => ({
          ...prev,
          [zoneId]: {
            items: prev[zoneId]?.items ?? [],
            loading: false,
            error: extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải danh sách Rack'),
            loaded: false,
          },
        }));
      });
  }

  function toggleZone(zoneId: string) {
    setExpandedZoneId((prev) => (prev === zoneId ? null : zoneId));

    const bucket = racksByZone[zoneId];
    if (!bucket?.loaded && !bucket?.loading) {
      void loadRacksForZone(zoneId);
    }
  }

  function selectRack(zoneId: string, rackId: string) {
    setSelectedZoneId(zoneId);
    setSelectedRackId(rackId);
  }

  function loadGrid(rackId: string) {
    setGridLoading(true);
    return levelService
      .getAll(rackId)
      .then(async (levels) => {
        const sortedLevels = [...levels].sort((a, b) => b.levelNumber - a.levelNumber);
        const slotsByLevel = await Promise.all(
          sortedLevels.map((level) => slotService.getAll({ levelId: level.id, limit: 200 })),
        );
        setGridRows(
          sortedLevels.map((level, index) => ({ level, slots: slotsByLevel[index].items })),
        );
        setGridError(null);
      })
      .catch((err) => {
        setGridError(extractErrorMessage(err, 'Đã có lỗi xảy ra khi tải sơ đồ kho'));
      })
      .finally(() => {
        setGridLoading(false);
      });
  }

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

  async function handleZoneSubmit(payload: CreateZonePayload | UpdateZonePayload) {
    try {
      if (zoneModal?.mode === 'create') {
        await zoneService.create(payload as CreateZonePayload);
      } else if (zoneModal?.mode === 'edit' && zoneModal.zone) {
        await zoneService.update(zoneModal.zone.id, payload as UpdateZonePayload);
      }
      setZoneModal(null);
      await loadZones();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Mã Zone này đã tồn tại. Vui lòng chọn mã khác.');
      } else {
        setToastMessage(
          zoneModal?.mode === 'create'
            ? 'Không thể tạo Zone. Vui lòng thử lại.'
            : 'Không thể cập nhật Zone. Vui lòng thử lại.',
        );
      }
    }
  }

  async function handleRackSubmit(payload: CreateRackPayload | UpdateRackPayload) {
    const zoneId = rackModal?.zoneId;
    try {
      if (rackModal?.mode === 'create') {
        await rackService.create(payload as CreateRackPayload);
      } else if (rackModal?.mode === 'edit' && rackModal.rack) {
        await rackService.update(rackModal.rack.id, payload as UpdateRackPayload);
      }
      setRackModal(null);
      if (zoneId) await loadRacksForZone(zoneId);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Mã Rack này đã tồn tại. Vui lòng chọn mã khác.');
      } else {
        setToastMessage(
          rackModal?.mode === 'create'
            ? 'Không thể tạo Rack. Vui lòng thử lại.'
            : 'Không thể cập nhật Rack. Vui lòng thử lại.',
        );
      }
    }
  }

  async function handleLevelSubmit(payload: CreateLevelPayload | UpdateLevelPayload) {
    try {
      if (levelModal?.mode === 'create') {
        await levelService.create(payload as CreateLevelPayload);
      } else if (levelModal?.mode === 'edit' && levelModal.level) {
        await levelService.update(levelModal.level.id, payload as UpdateLevelPayload);
      }
      setLevelModal(null);
      if (selectedRackId) await loadGrid(selectedRackId);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Tầng này đã tồn tại trong Rack. Vui lòng chọn số tầng khác.');
      } else {
        setToastMessage(
          levelModal?.mode === 'create'
            ? 'Không thể tạo Level. Vui lòng thử lại.'
            : 'Không thể cập nhật Level. Vui lòng thử lại.',
        );
      }
    }
  }

  async function handleSlotSubmit(payload: CreateSlotPayload | UpdateSlotPayload) {
    try {
      if (slotModal?.mode === 'create') {
        await slotService.create(payload as CreateSlotPayload);
      } else if (slotModal?.mode === 'edit' && slotModal.slot) {
        await slotService.update(slotModal.slot.id, payload as UpdateSlotPayload);
      }
      setSlotModal(null);
      setSelectedSlot(null);
      if (selectedRackId) await loadGrid(selectedRackId);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setToastMessage('Mã Slot này đã tồn tại. Vui lòng chọn mã khác.');
      } else {
        setToastMessage(
          slotModal?.mode === 'create'
            ? 'Không thể tạo Slot. Vui lòng thử lại.'
            : 'Không thể cập nhật Slot. Vui lòng thử lại.',
        );
      }
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      switch (deleteTarget.type) {
        case 'zone':
          await zoneService.remove(deleteTarget.id);
          setExpandedZoneId((prev) => (prev === deleteTarget.id ? null : prev));
          setRacksByZone((prev) => {
            const next = { ...prev };
            delete next[deleteTarget.id];
            return next;
          });
          if (selectedZoneId === deleteTarget.id) {
            setSelectedZoneId(null);
            setSelectedRackId(null);
          }
          await loadZones();
          break;
        case 'rack':
          await rackService.remove(deleteTarget.id);
          if (selectedRackId === deleteTarget.id) setSelectedRackId(null);
          await loadRacksForZone(deleteTarget.zoneId);
          break;
        case 'level':
          await levelService.remove(deleteTarget.id);
          if (selectedRackId) await loadGrid(selectedRackId);
          break;
        case 'slot':
          await slotService.remove(deleteTarget.id);
          setSelectedSlot(null);
          if (selectedRackId) await loadGrid(selectedRackId);
          break;
      }
      setDeleteTarget(null);
    } catch (err) {
      setToastMessage(extractErrorMessage(err, 'Không thể xoá. Vui lòng thử lại.'));
    } finally {
      setDeleting(false);
    }
  }

  function openSlotDetail(slot: Slot) {
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

  const selectedRack =
    selectedZoneId && selectedRackId
      ? racksByZone[selectedZoneId]?.items.find((rack) => rack.id === selectedRackId) ?? null
      : null;
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null;
  const columns = Array.from(
    new Set(gridRows.flatMap((row) => row.slots.map((slot) => slot.code))),
  ).sort(naturalCompare);

  return (
    <main className="app-content">
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      {zoneModal && (
        <ZoneFormModal
          mode={zoneModal.mode}
          initialData={zoneModal.zone}
          onSubmit={handleZoneSubmit}
          onClose={() => setZoneModal(null)}
        />
      )}

      {rackModal && (
        <RackFormModal
          mode={rackModal.mode}
          initialData={rackModal.rack}
          zoneId={rackModal.zoneId}
          onSubmit={handleRackSubmit}
          onClose={() => setRackModal(null)}
        />
      )}

      {levelModal && (
        <LevelFormModal
          mode={levelModal.mode}
          initialData={levelModal.level}
          rackId={selectedRackId ?? undefined}
          onSubmit={handleLevelSubmit}
          onClose={() => setLevelModal(null)}
        />
      )}

      {slotModal && (
        <SlotFormModal
          mode={slotModal.mode}
          initialData={slotModal.slot}
          levelId={slotModal.levelId}
          onSubmit={handleSlotSubmit}
          onClose={() => setSlotModal(null)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xoá"
        message={`Bạn có chắc muốn xoá "${deleteTarget?.label}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {selectedSlot && (
        <div className="dialog-overlay" onClick={() => setSelectedSlot(null)}>
          <div
            className="dialog-box warehouse-map-popup"
            onClick={(event) => event.stopPropagation()}
          >
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
                  {selectedSlot.currentProductId && selectedSlotProductLoading && 'Đang tải...'}
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
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setDeleteTarget({
                    type: 'slot',
                    id: selectedSlot.id,
                    label: `Slot ${selectedSlot.code}`,
                  })
                }
              >
                Xoá
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  setSlotModal({ mode: 'edit', slot: selectedSlot, levelId: selectedSlot.levelId })
                }
              >
                Sửa
              </button>
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
          <h1>Racking</h1>
          <p className="page-desc">
            Chọn Zone → Rack ở bên trái để xem và chỉnh sửa sơ đồ Level/Slot dạng lưới.
          </p>
        </div>
      </div>

      <div className="racking-layout">
        <aside className="panel racking-tree">
          <div className="panel-header">
            <div className="panel-header-title-group">
              <h2>Zones</h2>
              <button
                type="button"
                className="btn-secondary racking-add-btn racking-add-btn-inline"
                onClick={() => setZoneModal({ mode: 'create' })}
              >
                + Thêm Zone
              </button>
            </div>
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
            <ul className="racking-tree-list">
              {zones.map((zone) => {
                const isExpanded = expandedZoneId === zone.id;
                const bucket = racksByZone[zone.id];
                return (
                  <li key={zone.id}>
                    <div className="racking-tree-row">
                      <button
                        type="button"
                        className="racking-tree-expand"
                        onClick={() => toggleZone(zone.id)}
                        aria-label={
                          isExpanded ? `Thu gọn Zone ${zone.code}` : `Mở rộng Zone ${zone.code}`
                        }
                      >
                        {isExpanded ? '▾' : '▸'}
                      </button>
                      <button
                        type="button"
                        className="racking-tree-label"
                        onClick={() => toggleZone(zone.id)}
                      >
                        <WarehouseIcon size={15} />
                        <span>{zone.code}</span>
                      </button>
                      <button
                        type="button"
                        className="racking-list-item-edit"
                        onClick={() => setZoneModal({ mode: 'edit', zone })}
                        aria-label={`Sửa Zone ${zone.code}`}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="racking-list-item-delete"
                        onClick={() =>
                          setDeleteTarget({ type: 'zone', id: zone.id, label: `Zone ${zone.code}` })
                        }
                        aria-label={`Xoá Zone ${zone.code}`}
                      >
                        Xoá
                      </button>
                    </div>

                    {isExpanded && (
                      <ul className="racking-tree-sublist">
                        {bucket?.loading &&
                          Array.from({ length: 2 }).map((_, i) => (
                            <li key={i} className="racking-tree-row skeleton-row">
                              <span className="skeleton" style={{ width: '90px' }} />
                            </li>
                          ))}

                        {!bucket?.loading && bucket?.error && (
                          <li className="racking-tree-empty">{bucket.error}</li>
                        )}

                        {!bucket?.loading &&
                          !bucket?.error &&
                          bucket?.loaded &&
                          bucket.items.length === 0 && (
                            <li className="racking-tree-empty">Chưa có Rack nào.</li>
                          )}

                        {!bucket?.loading &&
                          !bucket?.error &&
                          bucket?.items.map((rack) => (
                            <li key={rack.id} className="racking-tree-row">
                              <button
                                type="button"
                                className={`racking-tree-label is-rack${
                                  selectedRackId === rack.id ? ' is-active' : ''
                                }`}
                                onClick={() => selectRack(zone.id, rack.id)}
                              >
                                <LayersIcon size={14} />
                                <span>{rack.code}</span>
                              </button>
                            </li>
                          ))}

                        <li>
                          <button
                            type="button"
                            className="racking-tree-add"
                            onClick={() => setRackModal({ mode: 'create', zoneId: zone.id })}
                          >
                            + Thêm Rack
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="panel racking-grid-panel">
          {!selectedRackId && (
            <div className="racking-empty-state">
              <p>Chọn Zone rồi chọn Rack ở bên trái để xem sơ đồ kho.</p>
            </div>
          )}

          {selectedRackId && (
            <>
              <div className="warehouse-map-panel-header">
                <p className="warehouse-map-caption">
                  {selectedZone?.code} – {selectedRack?.code}
                </p>
                {selectedRack && (
                  <div className="warehouse-map-panel-header-actions">
                    <button
                      type="button"
                      className="btn-secondary racking-add-btn"
                      onClick={() => setLevelModal({ mode: 'create' })}
                    >
                      + Thêm Level
                    </button>
                    <button
                      type="button"
                      className="racking-list-item-edit"
                      onClick={() =>
                        selectedZoneId &&
                        setRackModal({ mode: 'edit', rack: selectedRack, zoneId: selectedZoneId })
                      }
                    >
                      Sửa Rack
                    </button>
                    <button
                      type="button"
                      className="racking-list-item-delete"
                      onClick={() =>
                        selectedZoneId &&
                        setDeleteTarget({
                          type: 'rack',
                          id: selectedRack.id,
                          label: `Rack ${selectedRack.code}`,
                          zoneId: selectedZoneId,
                        })
                      }
                    >
                      Xoá Rack
                    </button>
                  </div>
                )}
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

              {gridLoading && (
                <div className="warehouse-map-skeleton">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="skeleton" style={{ height: '40px' }} />
                  ))}
                </div>
              )}

              {!gridLoading && gridError && (
                <div className="racking-empty-state">
                  <p>{gridError}</p>
                </div>
              )}

              {!gridLoading && !gridError && gridRows.length === 0 && (
                <div className="racking-empty-state">
                  <p>Rack này chưa có Level nào.</p>
                </div>
              )}

              {!gridLoading && !gridError && gridRows.length > 0 && (
                <div className="warehouse-map-scroll">
                  <div className="warehouse-map-grid">
                    {gridRows.map(({ level, slots }) => {
                      const codeToSlot = new Map(slots.map((slot) => [slot.code, slot]));
                      const menuOpen = openLevelMenuId === level.id;
                      return (
                        <div className="warehouse-map-row" key={level.id}>
                          <div className="warehouse-map-row-lead">
                            <span className="warehouse-map-row-label">L{level.levelNumber}</span>
                          </div>
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
                                  onClick={() => openSlotDetail(slot)}
                                  title={`${slot.code} — ${Math.round(slot.occupancyRate)}%`}
                                  aria-label={`Slot ${slot.code}, ${Math.round(slot.occupancyRate)}% lấp đầy`}
                                />
                              );
                            })}
                            <button
                              type="button"
                              className="warehouse-map-cell is-add"
                              onClick={() => setSlotModal({ mode: 'create', levelId: level.id })}
                              aria-label={`Thêm Slot vào Tầng ${level.levelNumber}`}
                              title="Thêm Slot"
                            >
                              +
                            </button>
                            <div className="row-menu">
                              <button
                                type="button"
                                className="row-menu-trigger"
                                onClick={() => setOpenLevelMenuId(menuOpen ? null : level.id)}
                                aria-label={`Hành động cho Tầng ${level.levelNumber}`}
                                aria-expanded={menuOpen}
                              >
                                ⋮
                              </button>
                              {menuOpen && (
                                <>
                                  <div
                                    className="row-menu-backdrop"
                                    onClick={() => setOpenLevelMenuId(null)}
                                  />
                                  <div className="row-menu-popover">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenLevelMenuId(null);
                                        setLevelModal({ mode: 'edit', level });
                                      }}
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      className="is-danger"
                                      onClick={() => {
                                        setOpenLevelMenuId(null);
                                        setDeleteTarget({
                                          type: 'level',
                                          id: level.id,
                                          label: `Tầng ${level.levelNumber}`,
                                        });
                                      }}
                                    >
                                      Xoá
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columns.length > 0 && (
                      <div className="warehouse-map-row warehouse-map-col-labels">
                        <span className="warehouse-map-row-lead" aria-hidden="true" />
                        <div className="warehouse-map-cells">
                          {columns.map((code) => (
                            <span key={code} className="warehouse-map-cell-label">
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}