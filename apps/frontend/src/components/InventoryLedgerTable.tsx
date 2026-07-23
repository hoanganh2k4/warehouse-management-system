import type { InventoryLedgerItem } from '../types';
import { AlertIcon, SwapIcon } from './icons';

type InventoryLedgerTableProps = {
  items: InventoryLedgerItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

function formatDateTime(value: string) {
  try {
    const date = new Date(value);
    const pad = (number: number) => String(number).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  } catch {
    return value;
  }
}

function typeLabel(type: InventoryLedgerItem['type']) {
  if (type === 'IMPORT') return 'Nhập kho';
  if (type === 'EXPORT') return 'Xuất kho';
  return 'Di chuyển';
}

function typeBadgeClass(type: InventoryLedgerItem['type']) {
  if (type === 'IMPORT') return 'badge badge-success';
  if (type === 'EXPORT') return 'badge badge-danger';
  return 'badge badge-standard';
}

export function InventoryLedgerTable({
  items,
  totalCount,
  loading,
  error,
}: InventoryLedgerTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Sản phẩm</th>
              <th>Vị trí</th>
              <th>Thay đổi</th>
              <th>Tồn trước</th>
              <th>Tồn sau</th>
              <th>STT ngày</th>
              <th>Mã đơn</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '120px' }} /></td>
                <td><span className="skeleton" style={{ width: '70px' }} /></td>
                <td><span className="skeleton" style={{ width: '150px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
                <td><span className="skeleton" style={{ width: '55px' }} /></td>
                <td><span className="skeleton" style={{ width: '55px' }} /></td>
                <td><span className="skeleton" style={{ width: '55px' }} /></td>
                <td><span className="skeleton" style={{ width: '45px' }} /></td>
                <td><span className="skeleton" style={{ width: '120px' }} /></td>
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
        <p className="state-title">Không tải được sổ biến động kho</p>
        <p className="state-body">{error}. Kiểm tra API đang chạy rồi thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <SwapIcon size={22} />
        <p className="state-title">Chưa có biến động kho nào</p>
        <p className="state-body">Biến động sẽ hiển thị sau khi có thao tác nhập, xuất hoặc di chuyển kho.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="state-panel">
        <SwapIcon size={22} />
        <p className="state-title">Không có kết quả phù hợp</p>
        <p className="state-body">Thử điều chỉnh lại bộ lọc sản phẩm, vị trí hoặc khoảng thời gian.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Loại</th>
            <th>Sản phẩm</th>
            <th>Vị trí</th>
            <th>Thay đổi</th>
            <th>Tồn trước</th>
            <th>Tồn sau</th>
            <th>STT ngày</th>
            <th>Mã đơn</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.transactionId}>
              <td className="muted-cell">{formatDateTime(item.occurredAt)}</td>
              <td>
                <span className={typeBadgeClass(item.type)}>{typeLabel(item.type)}</span>
              </td>
              <td>
                <span className="sku-code">{item.productSkuCode}</span> — {item.productName}
              </td>
              <td>
                {item.slotPath ? (
                  <span className="sku-code">{item.slotPath}</span>
                ) : (
                  <span className="muted-cell">—</span>
                )}
              </td>
              <td>
                <span
                  className={
                    item.changeQuantity >= 0
                      ? 'ledger-change-positive'
                      : 'ledger-change-negative'
                  }
                >
                  {item.changeQuantity >= 0 ? `+${item.changeQuantity}` : item.changeQuantity}
                </span>
              </td>
              <td>{item.balanceBefore}</td>
              <td>{item.balanceAfter}</td>
              <td>{item.dailySeq}</td>
              <td>
                {item.orderCode ? (
                  <span className="sku-code">{item.orderCode}</span>
                ) : (
                  <span className="muted-cell">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
