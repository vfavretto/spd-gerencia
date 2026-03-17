import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@spd/db';
import type { UserRepository } from '../repositories/UserRepository';
import { DeactivateUserUseCase } from '../useCases/DeactivateUserUseCase';

const makeUser = (overrides: Partial<IUsuario> = {}): IUsuario => ({
  id: 'user-1',
  nome: 'Maria Souza',
  email: 'maria@example.com',
  matricula: '54321',
  senha: 'hashed-password',
  role: UsuarioRole.ANALISTA,
  ativo: true,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  ...overrides
});

const makeRepository = (): jest.Mocked<UserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByMatricula: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn()
});

describe('DeactivateUserUseCase', () => {
  it('deve desativar o usuário', async () => {
    const repository = makeRepository();
    const sut = new DeactivateUserUseCase(repository);
    const user = makeUser();
    const updatedUser = makeUser({ ativo: false });

    repository.findById.mockResolvedValue(user);
    repository.update.mockResolvedValue(updatedUser);

    const result = await sut.execute({
      userId: user.id,
      actorId: 'admin-1'
    });

    expect(repository.update).toHaveBeenCalledWith(user.id, { ativo: false });
    expect(result).toEqual({ user: updatedUser, changed: true });
  });

  it('deve bloquear desativação da própria conta', async () => {
    const repository = makeRepository();
    const sut = new DeactivateUserUseCase(repository);

    await expect(
      sut.execute({
        userId: 'admin-1',
        actorId: 'admin-1'
      })
    ).rejects.toMatchObject({
      message: 'Você não pode desativar a própria conta',
      statusCode: 403
    });
  });

  it('deve ser idempotente para usuário já inativo', async () => {
    const repository = makeRepository();
    const sut = new DeactivateUserUseCase(repository);
    const user = makeUser({ ativo: false });

    repository.findById.mockResolvedValue(user);

    const result = await sut.execute({
      userId: user.id,
      actorId: 'admin-1'
    });

    expect(repository.update).not.toHaveBeenCalled();
    expect(result).toEqual({ user, changed: false });
  });
});
