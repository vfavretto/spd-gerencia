import type { TipoComunicado } from '@spd/db';

export type CreateComunicadoDTO = {
  protocolo: string;
  assunto: string;
  conteudo?: string;
  tipo: TipoComunicado;
  status?: string;
  origem?: string;
  destino?: string;
  responsavel?: string;
  arquivoUrl?: string;
  convenioId?: number | null;
};

export type UpdateComunicadoDTO = Partial<CreateComunicadoDTO>;
