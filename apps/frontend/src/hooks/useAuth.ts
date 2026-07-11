const TOKEN_KEY = 'wms_access_token';

export function useAuth() {
  const saveToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
  };

  return { saveToken, getToken, isAuthenticated, logout };
}
