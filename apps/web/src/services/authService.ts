import { api } from '../lib/api';
import type { LoginResponse } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      senha
    });
    return data;
  }
};
