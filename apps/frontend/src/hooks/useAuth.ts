import { authStorage } from '../lib/auth-storage';

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

  return { saveTokens, isAuthenticated, logout };
}