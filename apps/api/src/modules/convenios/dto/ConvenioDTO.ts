import type { ConvenioStatus } from '@spd/db';

export type CreateConvenioDTO = {
  codigo: string;
  titulo: string;
  objeto: string;
  descricao?: string | null;
  observacoes?: string | null;
  valorGlobal: number;
  valorRepasse?: number | null;
  valorContrapartida?: number | null;
  dataAssinatura?: Date | null;
  dataInicioVigencia?: Date | null;
  dataFimVigencia?: Date | null;
  dataPrestacaoContas?: Date | null;
  status?: ConvenioStatus;
  secretariaId: number;
  orgaoId?: number | null;
  programaId?: number | null;
  fonteId?: number | null;
};

export type UpdateConvenioDTO = Partial<CreateConvenioDTO>;
