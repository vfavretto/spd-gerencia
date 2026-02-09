import { api } from "@/modules/shared/lib/api";
import type { Convenio, ConvenioStatus, ValoresVigentes } from "@/modules/shared/types";

export type ConvenioFilters = {
  search?: string;
  status?: ConvenioStatus | "";
  secretariaId?: string | "";
  esfera?: string | "";
  modalidadeRepasse?: string | "";
  dataInicioVigencia?: string | "";
  dataFimVigencia?: string | "";
  valorMin?: string | "";
  valorMax?: string | "";
};

export const convenioService = {
  async list(filters?: ConvenioFilters): Promise<Convenio[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.secretariaId) params.secretariaId = filters.secretariaId;
    if (filters?.esfera) params.esfera = filters.esfera;
    if (filters?.modalidadeRepasse) params.modalidadeRepasse = filters.modalidadeRepasse;
    if (filters?.dataInicioVigencia) params.dataInicioVigencia = filters.dataInicioVigencia;
    if (filters?.dataFimVigencia) params.dataFimVigencia = filters.dataFimVigencia;
    if (filters?.valorMin) params.valorMin = filters.valorMin;
    if (filters?.valorMax) params.valorMax = filters.valorMax;

    const { data } = await api.get<Convenio[]>('/convenios', { params });
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
  }
};
