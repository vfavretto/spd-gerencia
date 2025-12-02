import { api } from '../lib/api';
import type { Pendencia, CreatePendenciaDTO, UpdatePendenciaDTO, StatusPendencia } from '../types';

export type PendenciaFilters = {
  status?: StatusPendencia;
  prioridade?: number;
};

export const pendenciaService = {
  listByConvenio: async (convenioId: number, filters?: PendenciaFilters): Promise<Pendencia[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.prioridade) params.set('prioridade', String(filters.prioridade));

    const response = await api.get(`/convenios/${convenioId}/pendencias?${params}`);
    return response.data;
  },

  getById: async (convenioId: number, id: number): Promise<Pendencia> => {
    const response = await api.get(`/convenios/${convenioId}/pendencias/${id}`);
    return response.data;
  },

  countByStatus: async (convenioId: number): Promise<Record<string, number>> => {
    const response = await api.get(`/convenios/${convenioId}/pendencias/count`);
    return response.data;
  },

  create: async (convenioId: number, data: CreatePendenciaDTO): Promise<Pendencia> => {
    const response = await api.post(`/convenios/${convenioId}/pendencias`, data);
    return response.data;
  },

  update: async (convenioId: number, id: number, data: UpdatePendenciaDTO): Promise<Pendencia> => {
    const response = await api.put(`/convenios/${convenioId}/pendencias/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: number, id: number): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/pendencias/${id}`);
  }
};

