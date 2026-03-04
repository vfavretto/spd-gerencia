import { api } from "@/modules/shared/lib/api";
import type {
  Catalogs,
  ModalidadeRepasseCatalogo,
  OrgaoConcedente,
  Programa,
  Secretaria
} from "@/modules/shared/types";

const endpoints = {
  secretarias: "/configuracoes/secretarias",
  orgaos: "/configuracoes/orgaos",
  programas: "/configuracoes/programas",
  modalidadesRepasse: "/configuracoes/modalidades-repasse"
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
  async listModalidadesRepasse(): Promise<ModalidadeRepasseCatalogo[]> {
    const { data } = await api.get<ModalidadeRepasseCatalogo[]>(endpoints.modalidadesRepasse);
    return data;
  },
  async getCatalogs(): Promise<Catalogs> {
    const [secretarias, orgaos, programas, modalidadesRepasse] = await Promise.all([
      this.listSecretarias(),
      this.listOrgaos(),
      this.listProgramas(),
      this.listModalidadesRepasse()
    ]);

    return { secretarias, orgaos, programas, modalidadesRepasse };
  },
  async create(resource: Resource, payload: Record<string, unknown>) {
    const { data } = await api.post(endpoints[resource], payload);
    return data;
  },
  async update(resource: Resource, id: string, payload: Record<string, unknown>) {
    const { data } = await api.put(`${endpoints[resource]}/${id}`, payload);
    return data;
  },
  async remove(resource: Resource, id: string) {
    await api.delete(`${endpoints[resource]}/${id}`);
  }
};
