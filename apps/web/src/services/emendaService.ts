import { api } from '../lib/api';
import type { EmendaParlamentar, CreateEmendaDTO, UpdateEmendaDTO } from '../types';

export const emendaService = {
  listByConvenio: async (convenioId: number): Promise<EmendaParlamentar[]> => {
    const response = await api.get(`/convenios/${convenioId}/emendas`);
    return response.data;
  },

  getById: async (id: number): Promise<EmendaParlamentar> => {
    const response = await api.get(`/emendas/${id}`);
    return response.data;
  },

  create: async (convenioId: number, data: CreateEmendaDTO): Promise<EmendaParlamentar> => {
    const response = await api.post(`/convenios/${convenioId}/emendas`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateEmendaDTO): Promise<EmendaParlamentar> => {
    const response = await api.put(`/convenios/${id}/emendas/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: number, id: number): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/emendas/${id}`);
  }
};

