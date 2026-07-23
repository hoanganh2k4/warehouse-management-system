import { useEffect, useState } from 'react';
import { CapacityBar } from '../../../components/CapacityBar';
import { inventoryService } from '../../../services/inventory.service';
import type { InventoryItem, Product, Rack, Slot, Zone } from '../../../types';
import { formatNumber, getCapacityTier } from '../../../utils/Capacity.utils';
import { formatDate, getExpiryBadgeClass, getExpiryLabel } from '../../../utils/expiry.utils';

type SlotDetailDialogProps = {
  slot: Slot;
  zone: Zone | null;
  rack: Rack | null;
  product: Product | null;
  productLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

type SlotBatchState = {
  slotId: string | null;
  items: InventoryItem[];
  error: string | null;
};

export function SlotDetailDialog({
  slot,
  zone,
  rack,
  product,
  productLoading,
  onClose,
  onEdit,
  onDelete,
}: SlotDetailDialogProps) {
  const [slotBatchState, setSlotBatchState] = useState<SlotBatchState>({
    slotId: null,
    items: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    inventoryService
      .getInventory({ slotId: slot.id, page: 1, limit: 10 })
      .then((result) => {
        if (cancelled) return;

        setSlotBatchState({
          slotId: slot.id,
          items: result.items,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setSlotBatchState({
          slotId: slot.id,
          items: [],
          error: error instanceof Error ? error.message : 'Không tải được hạn sử dụng',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [slot.id]);

  const isEmpty = slot.usedCapacity <= 0;
  const isFull = slot.usedCapacity >= slot.maxCapacity && slot.maxCapacity > 0;
  const tier = getCapacityTier(slot.occupancyRate, slot.usedCapacity);
  const slotBatchesLoading = slotBatchState.slotId !== slot.id;
  const slotBatches = slotBatchesLoading ? [] : slotBatchState.items;
  const slotBatchesError = slotBatchesLoading ? null : slotBatchState.error;
  const slotTooltip = [
    `Đang lưu: ${formatNumber(slot.usedCapacity)} đơn vị`,
    `Sức chứa: ${formatNumber(slot.maxCapacity)} đơn vị`,
    `Tỷ lệ sử dụng: ${Math.round(slot.occupancyRate)}%`,
  ].join('\n');

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box warehouse-map-popup" onClick={(event) => event.stopPropagation()}>
        <h3 className="dialog-title">
          Slot {slot.code}
          {zone && rack ? ` — ${zone.code} / ${rack.code}` : ''}
          {isEmpty && <span className="slot-status-badge is-empty-badge">Slot trống</span>}
          {isFull && <span className="slot-status-badge is-full-badge">Đầy</span>}
        </h3>
        <dl className="warehouse-map-popup-list">
          <div>
            <dt>Sức chứa</dt>
            <dd>
              {formatNumber(slot.usedCapacity)} / {formatNumber(slot.maxCapacity)}
            </dd>
          </div>
          <div className="warehouse-map-popup-progress-row">
            <div className="capacity-progress-top">
              <CapacityBar percent={slot.occupancyRate} tier={tier} tooltip={slotTooltip} size="sm" />
            </div>
          </div>
          <div>
            <dt>Còn trống</dt>
            <dd>{formatNumber(slot.availableCapacity)}</dd>
          </div>
          <div>
            <dt>Khoảng cách tới cổng</dt>
            <dd>{slot.distanceToGate} m</dd>
          </div>
          <div>
            <dt>Hàng hoá</dt>
            <dd>
              {!slot.currentProductId && 'Trống'}
              {slot.currentProductId && productLoading && 'Đang tải...'}
              {slot.currentProductId && !productLoading && product && (
                <>
                  {product.skuCode} — {product.name}
                  {product.isHeavy && <span className="heavy-badge">⚠ Hàng nặng</span>}
                </>
              )}
              {slot.currentProductId &&
                !productLoading &&
                !product &&
                'Không tải được thông tin sản phẩm'}
            </dd>
          </div>
          <div>
            <dt>Hạn sử dụng lô hàng</dt>
            <dd className="slot-expiry-list">
              {slotBatchesLoading && 'Đang tải...'}
              {!slotBatchesLoading && slotBatchesError && (
                <span className="slot-expiry-error">{slotBatchesError}</span>
              )}
              {!slotBatchesLoading && !slotBatchesError && slotBatches.length === 0 &&
                'Không có lô hàng'}
              {!slotBatchesLoading &&
                !slotBatchesError &&
                slotBatches.map((batch) => (
                  <div key={batch.id} className={getExpiryBadgeClass(batch.expiryStatus)}>
                    {batch.batchCode}: {formatDate(batch.expiryDate)} ·{' '}
                    {getExpiryLabel(batch.expiryStatus, batch.daysUntilExpiry)}
                  </div>
                ))}
            </dd>
          </div>
        </dl>
        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onDelete}>
            Xoá
          </button>
          <button type="button" className="btn-primary" onClick={onEdit}>
            Sửa
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
