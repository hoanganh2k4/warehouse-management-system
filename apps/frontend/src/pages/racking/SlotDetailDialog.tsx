import type { Product, Rack, Slot, Zone } from '../../../types';
import { CapacityBar, formatNumber, getCapacityTier } from '../../../components/CapacityBar';

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
  const isEmpty = slot.usedCapacity <= 0;
  const isFull = slot.usedCapacity >= slot.maxCapacity && slot.maxCapacity > 0;
  const tier = getCapacityTier(slot.occupancyRate, slot.usedCapacity);
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
              {formatNumber(slot.usedCapacity)} / {formatNumber(slot.maxCapacity)} đơn vị
            </dd>
          </div>
          <div className="warehouse-map-popup-progress-row">
            <div className="capacity-progress-top">
              <CapacityBar percent={slot.occupancyRate} tier={tier} tooltip={slotTooltip} size="sm" />
              <span className="capacity-progress-percent capacity-progress-percent--sm">
                {Math.round(slot.occupancyRate)}%
              </span>
            </div>
          </div>
          <div>
            <dt>Còn trống</dt>
            <dd>{formatNumber(slot.availableCapacity)} đơn vị</dd>
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
              {slot.currentProductId && !productLoading && product && `${product.skuCode} — ${product.name}`}
              {slot.currentProductId &&
                !productLoading &&
                !product &&
                'Không tải được thông tin sản phẩm'}
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
