import type { Transaction } from '../types';
import { AlertIcon, SwapIcon } from './icons';

type TransactionTableProps = {
  items: Transaction[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

function shortenId(id: string) {
  return id.slice(0, 8);
}

function formatDateTime(value: string) {
  try {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  } catch {
    return value;
  }
}

function typeLabel(type: Transaction['type']) {
  if (type === 'IMPORT') return 'Nhập kho';
  if (type === 'EXPORT') return 'Xuất kho';
  return 'Di chuyển';
}

function typeBadgeClass(type: Transaction['type']) {
  if (type === 'IMPORT') return 'badge badge-success';
  if (type === 'EXPORT') return 'badge badge-danger';
  return 'badge badge-standard';
}

export function TransactionTable({ items, totalCount, loading, error }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Số lượng</th>
              <th>Batch ID</th>
              <th>Từ Slot</th>
              <th>Đến Slot</th>
              <th>Ghi chú</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '70px' }} /></td>
                <td><span className="skeleton" style={{ width: '40px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
                <td><span className="skeleton" style={{ width: '100px' }} /></td>
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
        <p className="state-title">Không tải được lịch sử giao dịch</p>
        <p className="state-body">{error}. Kiểm tra API đang chạy rồi thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <SwapIcon size={22} />
        <p className="state-title">Chưa có giao dịch nào</p>
        <p className="state-body">Giao dịch sẽ hiển thị ở đây sau khi có thao tác nhập/xuất kho.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="state-panel">
        <SwapIcon size={22} />
        <p className="state-title">Không có kết quả phù hợp</p>
        <p className="state-body">Thử điều chỉnh lại bộ lọc loại giao dịch/ngày/sản phẩm.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Số lượng</th>
            <th>Batch ID</th>
            <th>Từ Slot</th>
            <th>Đến Slot</th>
            <th>Ghi chú</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={typeBadgeClass(item.type)}>{typeLabel(item.type)}</span>
              </td>
              <td>{item.quantity}</td>
              <td>
                <span className="sku-code">{shortenId(item.batchId)}</span>
              </td>
              <td>
                {item.slotFromId ? (
                  <span className="sku-code">{shortenId(item.slotFromId)}</span>
                ) : (
                  <span className="muted-cell">—</span>
                )}
              </td>
              <td>
                {item.slotToId ? (
                  <span className="sku-code">{shortenId(item.slotToId)}</span>
                ) : (
                  <span className="muted-cell">—</span>
                )}
              </td>
              <td className="muted-cell">{item.note ?? '—'}</td>
              <td className="muted-cell">{formatDateTime(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
