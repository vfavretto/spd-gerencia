import { api } from '../lib/api';
import type { Comunicado } from '../types';

export const comunicadoService = {
  async list(): Promise<Comunicado[]> {
    const { data } = await api.get<Comunicado[]>('/comunicados');
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<Comunicado> {
    const { data } = await api.post<Comunicado>('/comunicados', payload);
    return data;
  },

  async update(id: number, payload: Record<string, unknown>): Promise<Comunicado> {
    const { data } = await api.put<Comunicado>(`/comunicados/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/comunicados/${id}`);
  }
};
