import { authStorage } from "../lib/auth-storage";
import { MANAGER_ROLE } from "../lib/roles";


export function useAuth() {
  const saveTokens = (accessToken: string, refreshToken: string) => {
    authStorage.saveTokens(accessToken, refreshToken);
  };

  const isAuthenticated = (): boolean => {
    return authStorage.hasValidAccessToken() || authStorage.hasValidRefreshToken();
  };

  const logout = () => {
    authStorage.clear();
  };

  // Chỉ để hiển thị UI (ẩn/hiện menu, badge...). Quyền thực sự luôn được
  // backend kiểm tra lại — xem apps/backend/src/common/guards/roles.guard.ts.
  const currentUser = authStorage.getCurrentUser();
  const role = currentUser?.role ?? null;
  const username = currentUser?.username ?? null;
  const isManager = (): boolean => role === MANAGER_ROLE;

  return { saveTokens, isAuthenticated, logout, role, username, isManager };
}
