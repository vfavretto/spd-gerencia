import { api } from '../lib/api';
import type { Medicao, CreateMedicaoDTO, UpdateMedicaoDTO, SaldoContrato } from '../types';

export const medicaoService = {
  listByContrato: async (contratoId: number): Promise<Medicao[]> => {
    const response = await api.get(`/contratos/${contratoId}/medicoes`);
    return response.data;
  },

  getById: async (contratoId: number, id: number): Promise<Medicao> => {
    const response = await api.get(`/contratos/${contratoId}/medicoes/${id}`);
    return response.data;
  },

  getSaldo: async (contratoId: number): Promise<SaldoContrato> => {
    const response = await api.get(`/contratos/${contratoId}/medicoes/saldo`);
    return response.data;
  },

  create: async (contratoId: number, data: CreateMedicaoDTO): Promise<Medicao> => {
    const response = await api.post(`/contratos/${contratoId}/medicoes`, data);
    return response.data;
  },

  update: async (contratoId: number, id: number, data: UpdateMedicaoDTO): Promise<Medicao> => {
    const response = await api.put(`/contratos/${contratoId}/medicoes/${id}`, data);
    return response.data;
  },

  delete: async (contratoId: number, id: number): Promise<void> => {
    await api.delete(`/contratos/${contratoId}/medicoes/${id}`);
  }
};

