import { api } from '../lib/api';
import type { ContratoExecucao, CreateContratoDTO, UpdateContratoDTO } from '../types';

export const contratoService = {
  listByConvenio: async (convenioId: string): Promise<ContratoExecucao[]> => {
    const response = await api.get(`/convenios/${convenioId}/contratos`);
    return response.data;
  },

  getById: async (convenioId: string, id: string): Promise<ContratoExecucao> => {
    const response = await api.get(`/convenios/${convenioId}/contratos/${id}`);
    return response.data;
  },

  create: async (convenioId: string, data: CreateContratoDTO): Promise<ContratoExecucao> => {
    const response = await api.post(`/convenios/${convenioId}/contratos`, data);
    return response.data;
  },

  update: async (convenioId: string, id: string, data: UpdateContratoDTO): Promise<ContratoExecucao> => {
    const response = await api.put(`/convenios/${convenioId}/contratos/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: string, id: string): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/contratos/${id}`);
  }
};
