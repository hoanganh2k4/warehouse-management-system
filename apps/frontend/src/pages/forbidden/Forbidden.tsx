import { Link } from 'react-router-dom';
import { AlertIcon } from '../../components/icons';

export default function Forbidden() {
  return (
    <main className="app-content">
      <div className="state-panel state-error" style={{ margin: '40px auto', maxWidth: '420px' }}>
        <AlertIcon size={22} />
        <p className="state-title">Bạn không có quyền truy cập trang này</p>
        <p className="state-body">
          Trang này chỉ dành cho tài khoản Quản lý. Nếu bạn cần truy cập, vui lòng liên hệ Quản lý
          kho.
        </p>
        <Link to="/products" className="btn-secondary" style={{ marginTop: '12px' }}>
          Về trang Sản phẩm
        </Link>
      </div>
    </main>
  );
}
