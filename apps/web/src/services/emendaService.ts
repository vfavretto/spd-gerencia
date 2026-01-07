import { api } from '../lib/api';
import type { EmendaParlamentar, CreateEmendaDTO, UpdateEmendaDTO } from '../types';

export const emendaService = {
  listByConvenio: async (convenioId: string): Promise<EmendaParlamentar[]> => {
    const response = await api.get(`/convenios/${convenioId}/emendas`);
    return response.data;
  },

  getById: async (id: string): Promise<EmendaParlamentar> => {
    const response = await api.get(`/emendas/${id}`);
    return response.data;
  },

  create: async (convenioId: string, data: CreateEmendaDTO): Promise<EmendaParlamentar> => {
    const response = await api.post(`/convenios/${convenioId}/emendas`, data);
    return response.data;
  },

  update: async (convenioId: string, id: string, data: UpdateEmendaDTO): Promise<EmendaParlamentar> => {
    const response = await api.put(`/convenios/${convenioId}/emendas/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: string, id: string): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/emendas/${id}`);
  }
};
