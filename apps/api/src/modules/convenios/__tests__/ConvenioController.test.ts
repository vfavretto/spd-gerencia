import { z, ZodError } from 'zod';

// Replica os schemas do convenio.controller.ts para testar isoladamente
const commonSchema = {
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  objeto: z.string().min(1),
  descricao: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  valorGlobal: z.number().min(0),
  valorRepasse: z.number().min(0).nullable().optional(),
  valorContrapartida: z.number().min(0).nullable().optional(),
  dataAssinatura: z.coerce.date().nullable().optional(),
  dataInicioVigencia: z.coerce.date().nullable().optional(),
  dataFimVigencia: z.coerce.date().nullable().optional(),
  dataPrestacaoContas: z.coerce.date().nullable().optional(),
  status: z.enum(
    [
      'RASCUNHO',
      'EM_ANALISE',
      'APROVADO',
      'EM_EXECUCAO',
      'CONCLUIDO',
      'CANCELADO'
    ] as const
  ).optional(),
  numeroProposta: z.string().nullable().optional(),
  numeroTermo: z.string().nullable().optional(),
  esfera: z.enum(['FEDERAL', 'ESTADUAL']).nullable().optional(),
  modalidadeRepasseId: z.string().nullable().optional(),
  tipoTermoFormalizacaoId: z.string().nullable().optional(),
  processoSPD: z.string().nullable().optional(),
  processoCreditoAdicional: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  secretariaId: z.string(),
  orgaoId: z.string().nullable().optional(),
  programaId: z.string().nullable().optional()
};

const createSchema = z.object(commonSchema);
const updateSchema = createSchema.partial();

describe('ConvenioController — Zod Schemas', () => {
  const validPayload = {
    codigo: 'CONV-001',
    titulo: 'Convênio de Teste',
    objeto: 'Objeto de teste para o convênio',
    valorGlobal: 100000,
    secretariaId: 'sec-123'
  };

  describe('createSchema', () => {
    it('deve aceitar payload válido com campos obrigatórios', () => {
      const result = createSchema.parse(validPayload);

      expect(result.codigo).toBe('CONV-001');
      expect(result.titulo).toBe('Convênio de Teste');
      expect(result.objeto).toBe('Objeto de teste para o convênio');
      expect(result.valorGlobal).toBe(100000);
      expect(result.secretariaId).toBe('sec-123');
    });

    it('deve aceitar payload completo com todos os campos opcionais', () => {
      const fullPayload = {
        ...validPayload,
        descricao: 'Descrição detalhada',
        observacoes: 'Observações importantes',
        valorRepasse: 80000,
        valorContrapartida: 20000,
        dataAssinatura: '2025-01-15',
        dataInicioVigencia: '2025-02-01',
        dataFimVigencia: '2026-01-31',
        dataPrestacaoContas: '2026-03-01',
        status: 'EM_EXECUCAO' as const,
        orgaoId: 'org-456',
        programaId: 'prog-789',
        modalidadeRepasseId: 'modalidade-convenio',
        tipoTermoFormalizacaoId: 'tipo-termo-123',
        numeroProposta: 'PROP-001',
        numeroTermo: 'TC 001/2025'
      };

      const result = createSchema.parse(fullPayload);

      expect(result.descricao).toBe('Descrição detalhada');
      expect(result.valorRepasse).toBe(80000);
      expect(result.dataAssinatura).toBeInstanceOf(Date);
      expect(result.status).toBe('EM_EXECUCAO');
      expect(result.tipoTermoFormalizacaoId).toBe('tipo-termo-123');
      expect(result.numeroProposta).toBe('PROP-001');
      expect(result.numeroTermo).toBe('TC 001/2025');
    });

    it('deve aceitar campos nullable como null', () => {
      const payload = {
        ...validPayload,
        descricao: null,
        observacoes: null,
        valorRepasse: null,
        orgaoId: null
      };

      const result = createSchema.parse(payload);

      expect(result.descricao).toBeNull();
      expect(result.observacoes).toBeNull();
      expect(result.valorRepasse).toBeNull();
      expect(result.orgaoId).toBeNull();
    });

    it('deve rejeitar codigo vazio', () => {
      const payload = { ...validPayload, codigo: '' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar titulo vazio', () => {
      const payload = { ...validPayload, titulo: '' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar objeto vazio', () => {
      const payload = { ...validPayload, objeto: '' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar valorGlobal negativo', () => {
      const payload = { ...validPayload, valorGlobal: -1 };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve aceitar valorGlobal zero', () => {
      const payload = { ...validPayload, valorGlobal: 0 };
      const result = createSchema.parse(payload);

      expect(result.valorGlobal).toBe(0);
    });

    it('deve rejeitar sem codigo', () => {
      const { codigo, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem titulo', () => {
      const { titulo, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem objeto', () => {
      const { objeto, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem valorGlobal', () => {
      const { valorGlobal, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem secretariaId', () => {
      const { secretariaId, ...rest } = validPayload;

      expect(() => createSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar status inválido', () => {
      const payload = { ...validPayload, status: 'INVALIDO' };

      expect(() => createSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve aceitar todos os status válidos', () => {
      const statuses = [
        'RASCUNHO', 'EM_ANALISE', 'APROVADO',
        'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'
      ] as const;

      for (const status of statuses) {
        const result = createSchema.parse({ ...validPayload, status });
        expect(result.status).toBe(status);
      }
    });

    it('deve coercer strings de data para Date', () => {
      const payload = {
        ...validPayload,
        dataAssinatura: '2025-06-15T00:00:00.000Z'
      };

      const result = createSchema.parse(payload);

      expect(result.dataAssinatura).toBeInstanceOf(Date);
    });

    it('deve rejeitar payload completamente vazio', () => {
      expect(() => createSchema.parse({})).toThrow(ZodError);
    });
  });

  describe('updateSchema (partial)', () => {
    it('deve aceitar payload parcial com apenas um campo', () => {
      const result = updateSchema.parse({ titulo: 'Novo título' });

      expect(result.titulo).toBe('Novo título');
      expect(result.codigo).toBeUndefined();
    });

    it('deve aceitar payload vazio (nenhum campo obrigatório)', () => {
      const result = updateSchema.parse({});

      expect(result).toEqual({});
    });

    it('deve aceitar atualização apenas do valorGlobal', () => {
      const result = updateSchema.parse({ valorGlobal: 250000 });

      expect(result.valorGlobal).toBe(250000);
    });

    it('deve rejeitar valorGlobal negativo mesmo no partial', () => {
      expect(() => updateSchema.parse({ valorGlobal: -100 })).toThrow(ZodError);
    });

    it('deve rejeitar codigo vazio mesmo no partial', () => {
      expect(() => updateSchema.parse({ codigo: '' })).toThrow(ZodError);
    });

    it('deve rejeitar status inválido mesmo no partial', () => {
      expect(() => updateSchema.parse({ status: 'NAO_EXISTE' })).toThrow(ZodError);
    });
  });
});
