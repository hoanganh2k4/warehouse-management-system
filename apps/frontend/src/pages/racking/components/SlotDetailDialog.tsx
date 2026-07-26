import { useEffect, useState } from 'react';
import { CapacityBar } from '../../../components/CapacityBar';
import { EyeIcon } from '../../../components/icons';
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
  const [showInventory, setShowInventory] = useState(false);
  const [slotBatchState, setSlotBatchState] = useState<SlotBatchState>({
    slotId: null,
    items: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    inventoryService
      .getInventory({ slotId: slot.id, page: 1, limit: 100 })
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
          error: error instanceof Error ? error.message : 'Không tải được hàng hóa trong slot',
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
  const totalQuantity = slotBatches.reduce((sum, item) => sum + item.quantity, 0);
  const slotTooltip = [
    `Đang lưu: ${formatNumber(slot.usedCapacity)} đơn vị`,
    `Sức chứa: ${formatNumber(slot.maxCapacity)} đơn vị`,
    `Tỷ lệ sử dụng: ${Math.round(slot.occupancyRate)}%`,
  ].join('\n');

  return (
    <>
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
              <dt>Hàng hóa trong slot</dt>
              <dd>
                <button
                  type="button"
                  className="slot-inventory-trigger"
                  onClick={() => setShowInventory(true)}
                  aria-label={`Xem hàng hóa trong Slot ${slot.code}`}
                >
                  <EyeIcon size={17} />
                  {slotBatchesLoading
                    ? 'Đang tải...'
                    : slotBatches.length > 0
                      ? `Xem ${slotBatches.length} lô hàng`
                      : 'Xem danh sách'}
                </button>
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

      {showInventory && (
        <div
          className="dialog-overlay dialog-overlay-raised"
          onClick={(event) => {
            event.stopPropagation();
            setShowInventory(false);
          }}
        >
          <div
            className="dialog-box slot-inventory-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="slot-inventory-modal-header">
              <div>
                <h3 className="dialog-title">Hàng hóa trong Slot {slot.code}</h3>
                <p className="slot-inventory-summary">
                  {slotBatches.length} lô hàng · Tổng {formatNumber(totalQuantity)} đơn vị
                </p>
              </div>
            </div>

            {slotBatchesLoading ? (
              <div className="slot-inventory-state">Đang tải hàng hóa...</div>
            ) : slotBatchesError ? (
              <div className="slot-inventory-state slot-expiry-error">{slotBatchesError}</div>
            ) : slotBatches.length === 0 ? (
              <div className="slot-inventory-state">Slot hiện không có hàng hóa.</div>
            ) : (
              <div className="slot-inventory-table-wrap">
                <table className="product-table slot-inventory-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Mã lô</th>
                      <th>Số lượng</th>
                      <th>Hạn sử dụng</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td data-label="Sản phẩm">
                          <span className="sku-code">{batch.productSkuCode}</span>
                          <span className="slot-inventory-product-name"> — {batch.productName}</span>
                          {!productLoading && product?.isHeavy && (
                            <span className="heavy-badge">⚠ Hàng nặng</span>
                          )}
                        </td>
                        <td data-label="Mã lô"><span className="sku-code">{batch.batchCode}</span></td>
                        <td data-label="Số lượng">{formatNumber(batch.quantity)}</td>
                        <td data-label="Hạn sử dụng">{formatDate(batch.expiryDate)}</td>
                        <td data-label="Trạng thái">
                          <span className={getExpiryBadgeClass(batch.expiryStatus)}>
                            {getExpiryLabel(batch.expiryStatus, batch.daysUntilExpiry)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="dialog-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowInventory(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
