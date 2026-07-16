import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { zoneService } from '../../services/zone.service';
import { rackService } from '../../services/rack.service';
import { levelService } from '../../services/level.service';
import { slotService } from '../../services/slot.service';
import { productService } from '../../services/product.service';
import { ZoneFormModal } from '../../components/ZoneFormModal';
import { RackFormModal } from '../../components/RackFormModal';
import { LevelFormModal } from '../../components/LevelFormModal';
import { SlotFormModal } from '../../components/SlotFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { ZoneRackSidebar } from './components/ZoneRackSidebar';
import { RackingGridPanel } from './components/RackingGridPanel';
import { SlotDetailDialog } from './components/SlotDetailDialog';
import { extractErrorMessage, naturalCompare } from './racking.types';
import type { DeleteTarget, RackBucket, GridRow } from './racking.types';
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
        <SlotDetailDialog
          slot={selectedSlot}
          zone={selectedZone}
          rack={selectedRack}
          product={selectedSlotProduct}
          productLoading={selectedSlotProductLoading}
          onClose={() => setSelectedSlot(null)}
          onEdit={() =>
            setSlotModal({ mode: 'edit', slot: selectedSlot, levelId: selectedSlot.levelId })
          }
          onDelete={() =>
            setDeleteTarget({
              type: 'slot',
              id: selectedSlot.id,
              label: `Slot ${selectedSlot.code}`,
            })
          }
        />
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
        <ZoneRackSidebar
          zones={zones}
          zonesLoading={zonesLoading}
          zonesError={zonesError}
          expandedZoneId={expandedZoneId}
          racksByZone={racksByZone}
          selectedRackId={selectedRackId}
          onToggleZone={toggleZone}
          onSelectRack={selectRack}
          onEditZone={(zone) => setZoneModal({ mode: 'edit', zone })}
          onDeleteZone={(zone) =>
            setDeleteTarget({ type: 'zone', id: zone.id, label: `Zone ${zone.code}` })
          }
          onCreateZone={() => setZoneModal({ mode: 'create' })}
          onCreateRack={(zoneId) => setRackModal({ mode: 'create', zoneId })}
        />

        <RackingGridPanel
          selectedRackId={selectedRackId}
          selectedZone={selectedZone}
          selectedRack={selectedRack}
          gridRows={gridRows}
          gridLoading={gridLoading}
          gridError={gridError}
          columns={columns}
          openLevelMenuId={openLevelMenuId}
          onSetOpenLevelMenuId={setOpenLevelMenuId}
          onCreateLevel={() => setLevelModal({ mode: 'create' })}
          onEditRack={() =>
            selectedZoneId &&
            selectedRack &&
            setRackModal({ mode: 'edit', rack: selectedRack, zoneId: selectedZoneId })
          }
          onDeleteRack={() =>
            selectedZoneId &&
            selectedRack &&
            setDeleteTarget({
              type: 'rack',
              id: selectedRack.id,
              label: `Rack ${selectedRack.code}`,
              zoneId: selectedZoneId,
            })
          }
          onEditLevel={(level) => setLevelModal({ mode: 'edit', level })}
          onDeleteLevel={(level) =>
            setDeleteTarget({ type: 'level', id: level.id, label: `Tầng ${level.levelNumber}` })
          }
          onCreateSlot={(levelId) => setSlotModal({ mode: 'create', levelId })}
          onOpenSlotDetail={openSlotDetail}
        />
      </div>
    </main>
  );
}
