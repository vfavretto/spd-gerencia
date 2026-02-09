import { api } from "@/modules/shared/lib/api";
import type { ConvenioSnapshot } from "@/modules/shared/types";

export type SnapshotDiff = {
  campo: string;
  valorAnterior: unknown;
  valorNovo: unknown;
};

export type SnapshotCompareResult = {
  versao1: number;
  versao2: number;
  diferencas: SnapshotDiff[];
};

export const snapshotService = {
  async listByConvenio(convenioId: string): Promise<ConvenioSnapshot[]> {
    const { data } = await api.get<ConvenioSnapshot[]>(
      `/convenios/${convenioId}/snapshots`
    );
    return data;
  },

  async compare(
    convenioId: string,
    versao1: number,
    versao2: number
  ): Promise<SnapshotCompareResult> {
    const { data } = await api.get<SnapshotCompareResult>(
      `/convenios/${convenioId}/snapshots/compare`,
      { params: { versao1, versao2 } }
    );
    return data;
  }
};
