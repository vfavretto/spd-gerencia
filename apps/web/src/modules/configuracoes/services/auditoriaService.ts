import { api } from "@/modules/shared/lib/api";
import type { AuditLogListResponse } from "@/modules/shared/types";

export type AuditoriaFilters = {
  acao?: string;
  entidade?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
};

export const auditoriaService = {
  async list(filters?: AuditoriaFilters): Promise<AuditLogListResponse> {
    const params: Record<string, string | number> = {};
    if (filters?.acao) params.acao = filters.acao;
    if (filters?.entidade) params.entidade = filters.entidade;
    if (filters?.dataInicio) params.dataInicio = filters.dataInicio;
    if (filters?.dataFim) params.dataFim = filters.dataFim;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const { data } = await api.get<AuditLogListResponse>("/auditoria", { params });
    return data;
  }
};
