import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type RoleRouteProps = {
  roles: string[];
};

// Dùng lồng bên trong <ProtectedRoute /> — chỉ kiểm tra role sau khi đã chắc
// chắn người dùng đăng nhập. Đây là kiểm soát ở giao diện (ẩn/hiện trang),
// KHÔNG thay thế được kiểm tra quyền ở backend (RolesGuard đã áp dụng cho
// các API tương ứng), phòng trường hợp người dùng tự gọi thẳng API.
export default function RoleRoute({ roles }: RoleRouteProps) {
  const { role } = useAuth();

  if (!role || !roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
