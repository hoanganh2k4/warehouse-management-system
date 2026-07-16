const ACCESS_TOKEN_KEY = 'wms_access_token';
const REFRESH_TOKEN_KEY = 'wms_refresh_token';

type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  type?: 'refresh';
  iat: number;
  exp: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - 5000;
}

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    return !!token && !isTokenExpired(token);
  },

  hasValidRefreshToken(): boolean {
    const token = this.getRefreshToken();
    return !!token && !isTokenExpired(token);
  },

  // Đọc username/role trực tiếp từ access token đang có (không gọi API).
  // Chỉ dùng để hiển thị UI (ẩn/hiện menu, badge...) — KHÔNG phải cơ chế bảo
  // mật, vì token có thể hết hạn hoặc bị người dùng tự sửa ở phía client.
  // Quyền thực sự luôn được BE kiểm tra lại qua RolesGuard.
  getCurrentUser(): { username: string; role: string } | null {
    const token = this.getAccessToken();
    if (!token || isTokenExpired(token)) return null;
    const payload = decodeJwtPayload(token);
    if (!payload || payload.type === 'refresh') return null;
    return { username: payload.username, role: payload.role };
  },
};