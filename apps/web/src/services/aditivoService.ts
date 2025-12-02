import { api } from '../lib/api';
import type { Aditivo, CreateAditivoDTO, UpdateAditivoDTO, VigenciaInfo } from '../types';

export const aditivoService = {
  listByConvenio: async (convenioId: number): Promise<Aditivo[]> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos`);
    return response.data;
  },

  getById: async (convenioId: number, id: number): Promise<Aditivo> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos/${id}`);
    return response.data;
  },

  getVigencia: async (convenioId: number): Promise<VigenciaInfo> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos/vigencia`);
    return response.data;
  },

  create: async (convenioId: number, data: CreateAditivoDTO): Promise<Aditivo> => {
    const response = await api.post(`/convenios/${convenioId}/aditivos`, data);
    return response.data;
  },

  update: async (convenioId: number, id: number, data: UpdateAditivoDTO): Promise<Aditivo> => {
    const response = await api.put(`/convenios/${convenioId}/aditivos/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: number, id: number): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/aditivos/${id}`);
  }
};

