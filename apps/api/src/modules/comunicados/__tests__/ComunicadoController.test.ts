import { z, ZodError } from 'zod';

// Replica os schemas do comunicado.controller.ts para testar isoladamente
const createSchema = z.object({
  protocolo: z.string(),
  assunto: z.string().min(3),
  conteudo: z.string().nullable().optional(),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  dataRegistro: z.coerce.date().optional(),
  origem: z.string().nullable().optional(),
  destino: z.string().nullable().optional(),
  responsavel: z.string().nullable().optional(),
  arquivoUrl: z.string().url().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val)
});

const updateSchema = createSchema.partial();

describe('ComunicadoController — Zod Schemas', () => {
  const validPayload = {
    protocolo: 'PROT-2025-001',
    assunto: 'Assunto do comunicado',
    tipo: 'ENTRADA' as const
  };

  describe('createSchema', () => {
    it('deve aceitar payload válido com campos obrigatórios', () => {
      const result = createSchema.parse(validPayload);

      expect(result.protocolo).toBe('PROT-2025-001');
      expect(result.assunto).toBe('Assunto do comunicado');
      expect(result.tipo).toBe('ENTRADA');
    });

    it('deve aceitar payload completo com todos os campos opcionais', () => {
      const fullPayload = {
        ...validPayload,
        conteudo: 'Conteúdo completo do comunicado',
        dataRegistro: '2025-03-15',
        origem: 'Secretaria de Obras',
        destino: 'Secretaria de Finanças',
        responsavel: 'Maria Santos',
        arquivoUrl: 'https://example.com/doc.pdf'
      };

      const result = createSchema.parse(fullPayload);

      expect(result.conteudo).toBe('Conteúdo completo do comunicado');
      expect(result.dataRegistro).toBeInstanceOf(Date);
      expect(result.origem).toBe('Secretaria de Obras');
      expect(result.destino).toBe('Secretaria de Finanças');
      expect(result.responsavel).toBe('Maria Santos');
      expect(result.arquivoUrl).toBe('https://example.com/doc.pdf');
    });

    it('deve aceitar tipo SAIDA', () => {
      const payload = { ...validPayload, tipo: 'SAIDA' as const };
      const result = createSchema.parse(payload);

      expect(result.tipo).toBe('SAIDA');
    });

    it('deve rejeitar tipo inválido', () => {
      const payload = { ...validPayload, tipo: 'INTERNO' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar sem protocolo', () => {
      const { protocolo, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem assunto', () => {
      const { assunto, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar assunto com menos de 3 caracteres', () => {
      const payload = { ...validPayload, assunto: 'AB' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve aceitar assunto com exatamente 3 caracteres', () => {
      const payload = { ...validPayload, assunto: 'ABC' };
      const result = createSchema.parse(payload);

      expect(result.assunto).toBe('ABC');
    });

    it('deve rejeitar sem tipo', () => {
      const { tipo, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar payload completamente vazio', () => {
      expect(() => createSchema.parse({})).toThrow(ZodError);
    });

    it('deve aceitar campos nullable como null', () => {
      const payload = {
        ...validPayload,
        conteudo: null,
        origem: null,
        destino: null,
        responsavel: null,
        arquivoUrl: null
      };

      const result = createSchema.parse(payload);

      expect(result.conteudo).toBeNull();
      expect(result.origem).toBeNull();
      expect(result.destino).toBeNull();
      expect(result.responsavel).toBeNull();
      expect(result.arquivoUrl).toBeNull();
    });

    it('deve transformar arquivoUrl vazio em null', () => {
      const payload = { ...validPayload, arquivoUrl: '' };
      const result = createSchema.parse(payload);

      expect(result.arquivoUrl).toBeNull();
    });

    it('deve rejeitar arquivoUrl inválida (não URL)', () => {
      const payload = { ...validPayload, arquivoUrl: 'nao-eh-url' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve aceitar arquivoUrl válida', () => {
      const payload = { ...validPayload, arquivoUrl: 'https://cdn.example.com/arquivo.pdf' };
      const result = createSchema.parse(payload);

      expect(result.arquivoUrl).toBe('https://cdn.example.com/arquivo.pdf');
    });

    it('deve coercer string de data para Date em dataRegistro', () => {
      const payload = { ...validPayload, dataRegistro: '2025-06-01' };
      const result = createSchema.parse(payload);

      expect(result.dataRegistro).toBeInstanceOf(Date);
    });
  });

  describe('updateSchema (partial)', () => {
    it('deve aceitar payload parcial com apenas um campo', () => {
      const result = updateSchema.parse({ assunto: 'Novo assunto atualizado' });

      expect(result.assunto).toBe('Novo assunto atualizado');
      expect(result.protocolo).toBeUndefined();
    });

    it('deve aceitar payload vazio (nenhum campo obrigatório)', () => {
      const result = updateSchema.parse({});

      expect(result).toEqual({});
    });

    it('deve rejeitar assunto com menos de 3 caracteres mesmo no partial', () => {
      expect(() => updateSchema.parse({ assunto: 'AB' })).toThrow(ZodError);
    });

    it('deve rejeitar tipo inválido mesmo no partial', () => {
      expect(() => updateSchema.parse({ tipo: 'INVALIDO' })).toThrow(ZodError);
    });

    it('deve aceitar atualização apenas do tipo', () => {
      const result = updateSchema.parse({ tipo: 'SAIDA' });

      expect(result.tipo).toBe('SAIDA');
    });
  });
});
