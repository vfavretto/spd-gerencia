import { api } from "@/modules/shared/lib/api";
import type { NotaEmpenho, CreateNotaEmpenhoDTO, UpdateNotaEmpenhoDTO } from "@/modules/shared/types";

export const notaEmpenhoService = {
  async list(convenioId: string, tipo?: string): Promise<NotaEmpenho[]> {
    const params = tipo ? { tipo } : {};
    const { data } = await api.get<NotaEmpenho[]>(
      `/convenios/${convenioId}/notas-empenho`,
      { params }
    );
    return data;
  },

  async getById(convenioId: string, id: string): Promise<NotaEmpenho> {
    const { data } = await api.get<NotaEmpenho>(
      `/convenios/${convenioId}/notas-empenho/${id}`
    );
    return data;
  },

  async create(convenioId: string, dto: CreateNotaEmpenhoDTO): Promise<NotaEmpenho> {
    const { data } = await api.post<NotaEmpenho>(
      `/convenios/${convenioId}/notas-empenho`,
      dto
    );
    return data;
  },

  async update(convenioId: string, id: string, dto: UpdateNotaEmpenhoDTO): Promise<NotaEmpenho> {
    const { data } = await api.put<NotaEmpenho>(
      `/convenios/${convenioId}/notas-empenho/${id}`,
      dto
    );
    return data;
  },

  async delete(convenioId: string, id: string): Promise<void> {
    await api.delete(`/convenios/${convenioId}/notas-empenho/${id}`);
  }
};
