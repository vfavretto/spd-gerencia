import { api } from '../lib/api';
import type { Aditivo, CreateAditivoDTO, UpdateAditivoDTO, VigenciaInfo } from '../types';

export const aditivoService = {
  listByConvenio: async (convenioId: string): Promise<Aditivo[]> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos`);
    return response.data;
  },

  getById: async (convenioId: string, id: string): Promise<Aditivo> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos/${id}`);
    return response.data;
  },

  getVigencia: async (convenioId: string): Promise<VigenciaInfo> => {
    const response = await api.get(`/convenios/${convenioId}/aditivos/vigencia`);
    return response.data;
  },

  create: async (convenioId: string, data: CreateAditivoDTO): Promise<Aditivo> => {
    const response = await api.post(`/convenios/${convenioId}/aditivos`, data);
    return response.data;
  },

  update: async (convenioId: string, id: string, data: UpdateAditivoDTO): Promise<Aditivo> => {
    const response = await api.put(`/convenios/${convenioId}/aditivos/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: string, id: string): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/aditivos/${id}`);
  }
};
