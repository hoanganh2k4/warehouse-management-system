import '../../App.css';
import { useInventory } from '../../hooks/useInventory';
import { AlertIcon } from '../../components/icons';

export default function InventoryList() {
  const { items, loading, error, refetch } = useInventory({ page: 1, limit: 20 });

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Warehouse</p>
          <h1>Tồn kho</h1>
          <p className="page-desc">Theo dõi số lượng hàng tồn theo lô và vị trí lưu trữ.</p>
        </div>
      </div>

      {error ? (
        <div className="state-panel state-error">
          <AlertIcon size={22} />
          <p className="state-title">Không tải được dữ liệu tồn kho</p>
          <p className="state-body">{error}. Kiểm tra API và thử lại.</p>
          <button type="button" className="btn-primary" onClick={refetch}>
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className="state-panel">
          <p className="state-title">Đang tải…</p>
        </div>
      ) : (
        <p className="page-desc">Tìm thấy {items.length} dòng tồn kho.</p>
      )}
    </main>
  );
}
