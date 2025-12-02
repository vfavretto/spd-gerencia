import type { ModalidadeLicitacao } from '@spd/db';

export type CreateContratoDTO = {
  numProcessoLicitatorio?: string;
  modalidadeLicitacao?: ModalidadeLicitacao;
  numeroContrato?: string;
  contratadaCnpj?: string;
  contratadaNome?: string;
  dataAssinatura?: Date | null;
  dataVigenciaInicio?: Date | null;
  dataVigenciaFim?: Date | null;
  dataOIS?: Date | null;
  valorContrato?: number;
  valorExecutado?: number;
  engenheiroResponsavel?: string;
  creaEngenheiro?: string;
  artRrt?: string;
  situacao?: string;
  observacoes?: string;
  convenioId: number;
};

export type UpdateContratoDTO = Partial<Omit<CreateContratoDTO, 'convenioId'>>;

