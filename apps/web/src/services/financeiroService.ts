import { api } from '../lib/api';
import type { FinanceiroContas, UpsertFinanceiroDTO } from '../types';

export const financeiroService = {
  getByConvenio: async (convenioId: string): Promise<FinanceiroContas | null> => {
    const response = await api.get(`/convenios/${convenioId}/financeiro`);
    return response.data;
  },

  upsert: async (convenioId: string, data: UpsertFinanceiroDTO): Promise<FinanceiroContas> => {
    const response = await api.put(`/convenios/${convenioId}/financeiro`, data);
    return response.data;
  },

  delete: async (convenioId: string, id: string): Promise<void> => {
    await api.delete(`/convenios/${convenioId}/financeiro/${id}`);
  }
};
