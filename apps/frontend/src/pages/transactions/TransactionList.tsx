import '../../App.css';
import { useTransactions } from '../../hooks/useTransactions';

export default function TransactionList() {
  const { items, loading, error } = useTransactions({
    page: 1,
    limit: 20,
  });

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Lịch sử giao dịch</h1>
          <p className="page-desc">
            Nhật ký nhập/xuất/di chuyển hàng trong kho, được sinh tự động từ các thao tác kho.
          </p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Đang tải...</p>}
        {error && (
          <div className="state-panel state-error">
            <p className="state-body">{error}. Kiểm tra API đang chạy rồi thử lại.</p>
          </div>
        )}
        {!loading && !error && <p>{items.length} giao dịch.</p>}
      </section>
    </main>
  );
}
