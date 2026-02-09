import type { AuditUser } from '../services/AuditService';

const mockExecute = jest.fn().mockResolvedValue(undefined);

jest.mock('../repositories/implementations/PrismaAuditLogRepository', () => ({
  PrismaAuditLogRepository: jest.fn()
}));

jest.mock('../useCases/CreateAuditLogUseCase', () => ({
  CreateAuditLogUseCase: jest.fn().mockImplementation(() => ({
    execute: mockExecute
  }))
}));

// Import após os mocks para garantir que o módulo use as versões mockadas
import { AuditService } from '../services/AuditService';

const makeUser = (): AuditUser => ({
  id: 'user-1',
  nome: 'João Silva',
  email: 'joao@example.com'
});

describe('AuditService', () => {
  it('logCreate registra log de criação', async () => {
    const user = makeUser();
    const dadosNovos = { titulo: 'Convênio Teste' };

    await AuditService.logCreate(user, 'Convenio', 'conv-1', dadosNovos, '127.0.0.1', 'Jest');

    expect(mockExecute).toHaveBeenCalledWith({
      usuarioId: 'user-1',
      usuarioNome: 'João Silva',
      usuarioEmail: 'joao@example.com',
      acao: 'CREATE',
      entidade: 'Convenio',
      entidadeId: 'conv-1',
      dadosAntigos: undefined,
      dadosNovos,
      ip: '127.0.0.1',
      userAgent: 'Jest'
    });
  });

  it('logUpdate registra log de atualização', async () => {
    const user = makeUser();
    const dadosAntigos = { titulo: 'Antigo' };
    const dadosNovos = { titulo: 'Novo' };

    await AuditService.logUpdate(
      user,
      'Convenio',
      'conv-1',
      dadosAntigos,
      dadosNovos,
      '192.168.0.1',
      'Mozilla/5.0'
    );

    expect(mockExecute).toHaveBeenCalledWith({
      usuarioId: 'user-1',
      usuarioNome: 'João Silva',
      usuarioEmail: 'joao@example.com',
      acao: 'UPDATE',
      entidade: 'Convenio',
      entidadeId: 'conv-1',
      dadosAntigos,
      dadosNovos,
      ip: '192.168.0.1',
      userAgent: 'Mozilla/5.0'
    });
  });

  it('logDelete registra log de exclusão', async () => {
    const user = makeUser();
    const dadosAntigos = { titulo: 'Convênio Removido' };

    await AuditService.logDelete(user, 'Convenio', 'conv-1', dadosAntigos);

    expect(mockExecute).toHaveBeenCalledWith({
      usuarioId: 'user-1',
      usuarioNome: 'João Silva',
      usuarioEmail: 'joao@example.com',
      acao: 'DELETE',
      entidade: 'Convenio',
      entidadeId: 'conv-1',
      dadosAntigos,
      dadosNovos: undefined,
      ip: undefined,
      userAgent: undefined
    });
  });

  it('não lança erro mesmo se prisma falhar', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Prisma connection error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      AuditService.logCreate(makeUser(), 'Convenio', 'conv-1', { titulo: 'Teste' })
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[AuditService] Erro ao registrar log de auditoria:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
