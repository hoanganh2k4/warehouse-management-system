import type { Schedule } from '../types';
import { AlertIcon, CalendarPlusIcon } from './icons';
import {
  scheduleTypeLabel,
  scheduleTypeBadgeClass,
  scheduleStatusLabel,
  scheduleStatusBadgeClass,
} from '../utils/schedule.utils';

type ScheduleTableProps = {
  items: Schedule[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  cancellingId: string | null;
  onExecute: (schedule: Schedule) => void;
  onEdit: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
  onViewDetail: (schedule: Schedule) => void;
};

const COLUMN_COUNT = 8;

export function ScheduleTable({
  items,
  totalCount,
  loading,
  error,
  cancellingId,
  onExecute,
  onEdit,
  onCancel,
  onViewDetail,
}: ScheduleTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Khách hàng / NCC</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <td key={j}>
                    <span className="skeleton" style={{ width: '80px' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-error">
        <AlertIcon size={22} />
        <p className="state-title">Không tải được danh sách lịch nhập/xuất</p>
        <p className="state-body">{error}. Kiểm tra API đang chạy rồi thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <CalendarPlusIcon size={22} />
        <p className="state-title">Chưa có lịch nhập/xuất nào</p>
        <p className="state-body">
          Nhấn "Đặt lịch nhập" hoặc "Đặt lịch xuất" ở trên để tạo lịch mới.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Khách hàng / NCC</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={scheduleTypeBadgeClass(item.type)}>
                  {scheduleTypeLabel(item.type)}
                </span>
              </td>
              <td>{item.scheduledDate}</td>
              <td>{item.scheduledTime}</td>
              <td>
                {item.product ? (
                  <>
                    <span className="sku-code">{item.product.skuCode}</span> — {item.product.name}
                  </>
                ) : (
                  <span className="muted-cell">—</span>
                )}
              </td>
              <td>{item.quantity}</td>
              <td>{item.partnerName ?? <span className="muted-cell">—</span>}</td>
              <td>
                <span className={scheduleStatusBadgeClass(item.status)}>
                  {scheduleStatusLabel(item.status)}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  {item.status === 'PENDING' && (
                    <>
                      <button className="btn-secondary btn-sm" onClick={() => onExecute(item)}>
                        Thực hiện
                      </button>
                      <button className="btn-secondary btn-sm" onClick={() => onEdit(item)}>
                        Sửa
                      </button>
                      <button
                        className="btn-danger btn-sm"
                        disabled={cancellingId === item.id}
                        onClick={() => onCancel(item)}
                      >
                        {cancellingId === item.id ? 'Đang hủy...' : 'Hủy'}
                      </button>
                    </>
                  )}
                  {item.status !== 'PENDING' && (
                    <button className="btn-secondary btn-sm" onClick={() => onViewDetail(item)}>
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
