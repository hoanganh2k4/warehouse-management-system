import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MANAGER_ROLE } from '../lib/roles';

// Trang chủ "/" đưa mỗi người tới nơi phù hợp với họ, thay vì luôn về
// Dashboard (vốn chỉ Quản lý mới xem được).
export default function IndexRedirect() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role === MANAGER_ROLE) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/inventory" replace />;
}
