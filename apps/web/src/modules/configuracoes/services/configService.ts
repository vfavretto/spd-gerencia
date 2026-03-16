import { api } from "@/modules/shared/lib/api";
import type {
  Catalogs,
  ModalidadeRepasseCatalogo,
  OrgaoConcedente,
  Programa,
  Secretaria,
  TipoTermoFormalizacaoCatalogo
} from "@/modules/shared/types";

const endpoints = {
  secretarias: "/configuracoes/secretarias",
  orgaos: "/configuracoes/orgaos",
  programas: "/configuracoes/programas",
  modalidadesRepasse: "/configuracoes/modalidades-repasse",
  tiposTermoFormalizacao: "/configuracoes/tipos-termo-formalizacao"
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
  async listTiposTermoFormalizacao(): Promise<TipoTermoFormalizacaoCatalogo[]> {
    const { data } = await api.get<TipoTermoFormalizacaoCatalogo[]>(endpoints.tiposTermoFormalizacao);
    return data;
  },
  async getCatalogs(): Promise<Catalogs> {
    const [secretarias, orgaos, programas, modalidadesRepasse, tiposTermoFormalizacao] = await Promise.all([
      this.listSecretarias(),
      this.listOrgaos(),
      this.listProgramas(),
      this.listModalidadesRepasse(),
      this.listTiposTermoFormalizacao()
    ]);

    return { secretarias, orgaos, programas, modalidadesRepasse, tiposTermoFormalizacao };
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
