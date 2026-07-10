import { apiClient } from '../lib/api-client';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiClient.post('/auth/login', { username, password });
}
