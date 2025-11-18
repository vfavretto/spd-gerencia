import { api } from '../lib/api';
import type { EventoAgenda } from '../types';

export const agendaService = {
  async listEventos(): Promise<EventoAgenda[]> {
    const { data } = await api.get<EventoAgenda[]>('/agenda/eventos');
    return data;
  },

  async createEvento(payload: Record<string, unknown>): Promise<EventoAgenda> {
    const { data } = await api.post<EventoAgenda>('/agenda/eventos', payload);
    return data;
  },

  async updateEvento(
    id: number,
    payload: Record<string, unknown>
  ): Promise<EventoAgenda> {
    const { data } = await api.put<EventoAgenda>(`/agenda/eventos/${id}`, payload);
    return data;
  },

  async removeEvento(id: number): Promise<void> {
    await api.delete(`/agenda/eventos/${id}`);
  }
};
