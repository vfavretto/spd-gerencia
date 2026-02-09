export type CreateComunicadoDTO = {
  protocolo: string;
  assunto: string;
  conteudo?: string;
  tipo: 'ENTRADA' | 'SAIDA';
  dataRegistro?: Date;
  origem?: string;
  destino?: string;
  responsavel?: string;
  arquivoUrl?: string;
};

export type UpdateComunicadoDTO = Partial<CreateComunicadoDTO>;
