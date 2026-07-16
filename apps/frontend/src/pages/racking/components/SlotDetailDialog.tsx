import type { Product, Rack, Slot, Zone } from '../../../types';

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
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box warehouse-map-popup" onClick={(event) => event.stopPropagation()}>
        <h3 className="dialog-title">
          Slot {slot.code}
          {zone && rack ? ` — ${zone.code} / ${rack.code}` : ''}
        </h3>
        <dl className="warehouse-map-popup-list">
          <div>
            <dt>Sức chứa</dt>
            <dd>
              {slot.usedCapacity} / {slot.maxCapacity}
            </dd>
          </div>
          <div>
            <dt>Độ lấp đầy</dt>
            <dd>{Math.round(slot.occupancyRate)}%</dd>
          </div>
          <div>
            <dt>Còn trống</dt>
            <dd>{slot.availableCapacity}</dd>
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
