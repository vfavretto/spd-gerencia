import { api } from "@/modules/shared/lib/api";
import type { FichaOrcamentaria, CreateFichaOrcamentariaDTO, UpdateFichaOrcamentariaDTO } from "@/modules/shared/types";

export const fichaOrcamentariaService = {
  async list(convenioId: string, tipo?: string): Promise<FichaOrcamentaria[]> {
    const params = tipo ? { tipo } : {};
    const { data } = await api.get<FichaOrcamentaria[]>(
      `/convenios/${convenioId}/fichas-orcamentarias`,
      { params }
    );
    return data;
  },

  async getById(convenioId: string, id: string): Promise<FichaOrcamentaria> {
    const { data } = await api.get<FichaOrcamentaria>(
      `/convenios/${convenioId}/fichas-orcamentarias/${id}`
    );
    return data;
  },

  async create(convenioId: string, dto: CreateFichaOrcamentariaDTO): Promise<FichaOrcamentaria> {
    const { data } = await api.post<FichaOrcamentaria>(
      `/convenios/${convenioId}/fichas-orcamentarias`,
      dto
    );
    return data;
  },

  async update(convenioId: string, id: string, dto: UpdateFichaOrcamentariaDTO): Promise<FichaOrcamentaria> {
    const { data } = await api.put<FichaOrcamentaria>(
      `/convenios/${convenioId}/fichas-orcamentarias/${id}`,
      dto
    );
    return data;
  },

  async delete(convenioId: string, id: string): Promise<void> {
    await api.delete(`/convenios/${convenioId}/fichas-orcamentarias/${id}`);
  }
};
