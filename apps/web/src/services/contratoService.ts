import { api } from '../lib/api';
import type { ContratoExecucao, CreateContratoDTO, UpdateContratoDTO } from '../types';

export const contratoService = {
  listByConvenio: async (convenioId: number): Promise<ContratoExecucao[]> => {
    const response = await api.get(`/convenios/${convenioId}/contratos`);
    return response.data;
  },

  getById: async (convenioId: number, id: number): Promise<ContratoExecucao> => {
    const response = await api.get(`/convenios/${convenioId}/contratos/${id}`);
    return response.data;
  },

  create: async (convenioId: number, data: CreateContratoDTO): Promise<ContratoExecucao> => {
    const response = await api.post(`/convenios/${convenioId}/contratos`, data);
    return response.data;
  },

  update: async (convenioId: number, id: number, data: UpdateContratoDTO): Promise<ContratoExecucao> => {
    const response = await api.put(`/convenios/${convenioId}/contratos/${id}`, data);
    return response.data;
  },

  delete: async (convenioId: number, id: number): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/contratos/${id}`);
  }
};

