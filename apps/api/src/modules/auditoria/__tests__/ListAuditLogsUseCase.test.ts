import { ListAuditLogsUseCase } from '../useCases/ListAuditLogsUseCase';
import type { IAuditLogRepository, AuditLogResult } from '../repositories/AuditLogRepository';
import { AcaoAuditoria } from '@spd/db';

const makeRepository = (): jest.Mocked<IAuditLogRepository> => ({
  create: jest.fn(),
  findMany: jest.fn(),
  findById: jest.fn(),
  findByEntidade: jest.fn()
});

const makePaginatedResult = (data: AuditLogResult[] = []) => ({
  data,
  total: data.length,
  page: 1,
  totalPages: 1
});

const makeAuditLog = (id: string): AuditLogResult => ({
  id,
  usuarioId: 'user-1',
  usuarioNome: 'João Silva',
  usuarioEmail: 'joao@example.com',
  acao: AcaoAuditoria.CREATE,
  entidade: 'Convenio',
  entidadeId: 'conv-1',
  dadosAntigos: null,
  dadosNovos: { titulo: 'Novo' },
  ip: '127.0.0.1',
  userAgent: 'Jest',
  criadoEm: new Date('2026-01-15T10:00:00Z')
});

describe('ListAuditLogsUseCase', () => {
  let sut: ListAuditLogsUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new ListAuditLogsUseCase(repository);
  });

  it('deve listar logs de auditoria com filtros', async () => {
    const logs = [makeAuditLog('log-1'), makeAuditLog('log-2')];
    const paginatedResult = makePaginatedResult(logs);
    repository.findMany.mockResolvedValue(paginatedResult);

    const result = await sut.execute({
      usuarioId: 'user-1',
      entidade: 'Convenio',
      acao: AcaoAuditoria.CREATE,
      page: 2,
      limit: 10
    });

    expect(repository.findMany).toHaveBeenCalledWith(
      {
        usuarioId: 'user-1',
        entidade: 'Convenio',
        entidadeId: undefined,
        acao: AcaoAuditoria.CREATE,
        dataInicio: undefined,
        dataFim: undefined
      },
      2,
      10
    );
    expect(result).toEqual(paginatedResult);
  });

  it('deve usar valores padrão quando filtros não são fornecidos', async () => {
    const paginatedResult = makePaginatedResult([]);
    repository.findMany.mockResolvedValue(paginatedResult);

    const result = await sut.execute({});

    expect(repository.findMany).toHaveBeenCalledWith(
      {
        usuarioId: undefined,
        entidade: undefined,
        entidadeId: undefined,
        acao: undefined,
        dataInicio: undefined,
        dataFim: undefined
      },
      1,
      20
    );
    expect(result).toEqual(paginatedResult);
  });

  it('deve converter strings de data para objetos Date', async () => {
    const paginatedResult = makePaginatedResult([]);
    repository.findMany.mockResolvedValue(paginatedResult);

    await sut.execute({
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31'
    });

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-01-31')
      }),
      1,
      20
    );
  });
});
