export type CreateComunicadoDTO = {
  protocolo: string;
  assunto: string;
  conteudo?: string;
  tipo: 'ENTRADA' | 'SAIDA';
  status?: string;
  origem?: string;
  destino?: string;
  responsavel?: string;
  arquivoUrl?: string;
  convenioId?: string | null;
};

export type UpdateComunicadoDTO = Partial<CreateComunicadoDTO>;
