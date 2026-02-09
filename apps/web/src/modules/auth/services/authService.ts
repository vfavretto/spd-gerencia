import { api } from "@/modules/shared/lib/api";
import type { LoginResponse, RegisterUserDTO, UserListItem } from "@/modules/shared/types";

export const authService = {
  async login(matricula: string, senha: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      matricula,
      senha
    });
    return data;
  },

  async register(payload: RegisterUserDTO): Promise<UserListItem> {
    const { data } = await api.post<UserListItem>("/auth/register", payload);
    return data;
  },

  async listUsers(): Promise<UserListItem[]> {
    const { data } = await api.get<UserListItem[]>("/auth/users");
    return data;
  }
};
