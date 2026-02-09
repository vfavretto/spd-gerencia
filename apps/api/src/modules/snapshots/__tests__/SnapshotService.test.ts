import type { SnapshotUser } from '../services/SnapshotService';

const mockExecute = jest.fn().mockResolvedValue(undefined);

jest.mock('../repositories/implementations/PrismaSnapshotRepository', () => ({
  PrismaSnapshotRepository: jest.fn()
}));

jest.mock('../useCases/CreateSnapshotUseCase', () => ({
  CreateSnapshotUseCase: jest.fn().mockImplementation(() => ({
    execute: mockExecute
  }))
}));

// Import após os mocks para garantir que o módulo use as versões mockadas
import { SnapshotService } from '../services/SnapshotService';

const makeUser = (): SnapshotUser => ({
  id: 'user-1',
  nome: 'João Silva'
});

const makeDadosConvenio = (): Record<string, unknown> => ({
  numero: '001/2026',
  objeto: 'Obra de infraestrutura',
  valorTotal: 500000,
  situacao: 'EM_EXECUCAO'
});

describe('SnapshotService', () => {
  it('cria snapshot com sucesso', async () => {
    const user = makeUser();
    const dados = makeDadosConvenio();

    await SnapshotService.createSnapshot('conv-1', dados, 'Alteração de dados', user);

    expect(mockExecute).toHaveBeenCalledWith({
      convenioId: 'conv-1',
      dados,
      criadoPorId: 'user-1',
      criadoPorNome: 'João Silva',
      motivoSnapshot: 'Alteração de dados'
    });
  });

  it('cria snapshot via beforeUpdate', async () => {
    const user = makeUser();
    const dados = makeDadosConvenio();

    await SnapshotService.beforeUpdate('conv-2', dados, user);

    expect(mockExecute).toHaveBeenCalledWith({
      convenioId: 'conv-2',
      dados,
      criadoPorId: 'user-1',
      criadoPorNome: 'João Silva',
      motivoSnapshot: 'Alteração de dados'
    });
  });

  it('cria snapshot sem usuário', async () => {
    const dados = makeDadosConvenio();

    await SnapshotService.createSnapshot('conv-3', dados, 'Snapshot automático');

    expect(mockExecute).toHaveBeenCalledWith({
      convenioId: 'conv-3',
      dados,
      criadoPorId: undefined,
      criadoPorNome: undefined,
      motivoSnapshot: 'Snapshot automático'
    });
  });

  it('não lança erro se prisma falhar', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Prisma connection error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      SnapshotService.createSnapshot('conv-1', makeDadosConvenio(), 'Teste', makeUser())
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[SnapshotService] Erro ao criar snapshot:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
