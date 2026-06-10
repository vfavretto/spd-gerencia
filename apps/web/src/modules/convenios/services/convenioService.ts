import { api } from "@/modules/shared/lib/api";
import type { Convenio, ConvenioStatus, PaginatedResult, ValoresVigentes } from "@/modules/shared/types";

export type ConvenioFilters = {
  search?: string;
  status?: ConvenioStatus | "";
  secretariaId?: string | "";
  esfera?: string | "";
  modalidadeRepasseId?: string | "";
  dataInicioVigencia?: string | "";
  dataFimVigencia?: string | "";
  valorMin?: number;
  valorMax?: number;
  page?: number;
  limit?: number;
};

export const convenioService = {
  async list(filters?: ConvenioFilters): Promise<PaginatedResult<Convenio>> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.secretariaId) params.secretariaId = filters.secretariaId;
    if (filters?.esfera) params.esfera = filters.esfera;
    if (filters?.modalidadeRepasseId) params.modalidadeRepasseId = filters.modalidadeRepasseId;
    if (filters?.dataInicioVigencia) params.dataInicioVigencia = filters.dataInicioVigencia;
    if (filters?.dataFimVigencia) params.dataFimVigencia = filters.dataFimVigencia;
    if (filters?.valorMin !== undefined) params.valorMin = String(filters.valorMin);
    if (filters?.valorMax !== undefined) params.valorMax = String(filters.valorMax);
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    const { data } = await api.get<PaginatedResult<Convenio>>('/convenios', { params });
    return data;
  },

  async getById(id: string): Promise<Convenio> {
    const { data } = await api.get<Convenio>(`/convenios/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<Convenio> {
    const { data } = await api.post<Convenio>('/convenios', payload);
    return data;
  },

  async update(id: string, payload: Record<string, unknown>): Promise<Convenio> {
    const { data } = await api.put<Convenio>(`/convenios/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/convenios/${id}`);
  },

  async getValoresVigentes(id: string): Promise<ValoresVigentes> {
    const { data } = await api.get<ValoresVigentes>(`/convenios/${id}/valores-vigentes`);
    return data;
  },

  async concluir(id: string): Promise<Convenio> {
    const { data } = await api.post<Convenio>(`/convenios/${id}/concluir`);
    return data;
  },

  async cancelar(id: string): Promise<Convenio> {
    const { data } = await api.post<Convenio>(`/convenios/${id}/cancelar`);
    return data;
  }
};
