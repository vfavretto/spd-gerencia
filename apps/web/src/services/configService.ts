import { api } from '../lib/api';
import type {
  Catalogs,
  FonteRecurso,
  OrgaoConcedente,
  Programa,
  Secretaria
} from '../types';

const endpoints = {
  secretarias: '/configuracoes/secretarias',
  orgaos: '/configuracoes/orgaos',
  programas: '/configuracoes/programas',
  fontes: '/configuracoes/fontes'
} as const;

type Resource = keyof typeof endpoints;

export const configService = {
  async listSecretarias(): Promise<Secretaria[]> {
    const { data } = await api.get<Secretaria[]>(endpoints.secretarias);
    return data;
  },
  async listOrgaos(): Promise<OrgaoConcedente[]> {
    const { data } = await api.get<OrgaoConcedente[]>(endpoints.orgaos);
    return data;
  },
  async listProgramas(): Promise<Programa[]> {
    const { data } = await api.get<Programa[]>(endpoints.programas);
    return data;
  },
  async listFontes(): Promise<FonteRecurso[]> {
    const { data } = await api.get<FonteRecurso[]>(endpoints.fontes);
    return data;
  },
  async getCatalogs(): Promise<Catalogs> {
    const [secretarias, orgaos, programas, fontes] = await Promise.all([
      this.listSecretarias(),
      this.listOrgaos(),
      this.listProgramas(),
      this.listFontes()
    ]);

    return { secretarias, orgaos, programas, fontes };
  },
  async create(resource: Resource, payload: Record<string, unknown>) {
    const { data } = await api.post(endpoints[resource], payload);
    return data;
  },
  async update(resource: Resource, id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`${endpoints[resource]}/${id}`, payload);
    return data;
  },
  async remove(resource: Resource, id: number) {
    await api.delete(`${endpoints[resource]}/${id}`);
  }
};
