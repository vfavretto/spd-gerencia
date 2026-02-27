import { api } from "@/modules/shared/lib/api";
import type { Comunicado, TipoComunicado } from "@/modules/shared/types";

export interface ComunicadoFilters {
  tipo?: TipoComunicado | "";
  search?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const comunicadoService = {
  async list(filters?: ComunicadoFilters): Promise<Comunicado[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append("tipo", filters.tipo);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.responsavel) params.append("responsavel", filters.responsavel);
    if (filters?.dataInicio) params.append("dataInicio", filters.dataInicio);
    if (filters?.dataFim) params.append("dataFim", filters.dataFim);
    const queryString = params.toString();
    const { data } = await api.get<Comunicado[]>(
      `/comunicados${queryString ? `?${queryString}` : ""}`
    );
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<Comunicado> {
    const { data } = await api.post<Comunicado>("/comunicados", payload);
    return data;
  },

  async update(id: string, payload: Record<string, unknown>): Promise<Comunicado> {
    const { data } = await api.put<Comunicado>(`/comunicados/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/comunicados/${id}`);
  }
};
