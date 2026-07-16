import type { InventoryItem } from '../types';
import { AlertIcon, LayersIcon } from './icons';

type InventoryTableProps = {
  items: InventoryItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

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

export function InventoryTable({ items, totalCount, loading, error }: InventoryTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Mã lô hàng</th>
              <th>Vị trí</th>
              <th>Số lượng</th>
              <th>Cập nhật lúc</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '160px' }} /></td>
                <td><span className="skeleton" style={{ width: '80px' }} /></td>
                <td><span className="skeleton" style={{ width: '60px' }} /></td>
                <td><span className="skeleton" style={{ width: '50px' }} /></td>
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
        <p className="state-title">Không tải được tồn kho</p>
        <p className="state-body">{error}. Kiểm tra API đang chạy rồi thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <LayersIcon size={22} />
        <p className="state-title">Chưa có dữ liệu tồn kho</p>
        <p className="state-body">Tồn kho sẽ hiển thị ở đây sau khi có giao dịch nhập hàng.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="state-panel">
        <LayersIcon size={22} />
        <p className="state-title">Không có kết quả phù hợp</p>
        <p className="state-body">Thử điều chỉnh lại bộ lọc sản phẩm/kho.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Mã lô hàng</th>
            <th>Vị trí</th>
            <th>Số lượng</th>
            <th>Cập nhật lúc</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="sku-code">{item.productSkuCode}</span> — {item.productName}
              </td>
              <td>
                <span className="sku-code">{item.batchCode}</span>
              </td>
              <td>
                <span className="sku-code">{item.slotCode}</span>
              </td>
              <td>{item.quantity}</td>
              <td className="muted-cell">{formatDateTime(item.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
