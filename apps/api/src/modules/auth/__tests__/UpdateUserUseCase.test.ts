import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@spd/db';
import type { UserRepository } from '../repositories/UserRepository';
import { UpdateUserUseCase } from '../useCases/UpdateUserUseCase';

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

describe('UpdateUserUseCase', () => {
  it('deve atualizar a role do usuário', async () => {
    const repository = makeRepository();
    const sut = new UpdateUserUseCase(repository);
    const user = makeUser();
    const updatedUser = makeUser({ role: UsuarioRole.ADMIN });

    repository.findById.mockResolvedValue(user);
    repository.update.mockResolvedValue(updatedUser);

    const result = await sut.execute({
      userId: user.id,
      actorId: 'admin-1',
      role: UsuarioRole.ADMIN
    });

    expect(repository.update).toHaveBeenCalledWith(user.id, { role: UsuarioRole.ADMIN });
    expect(result).toEqual({ user: updatedUser, changed: true });
  });

  it('deve bloquear alteração da própria role', async () => {
    const repository = makeRepository();
    const sut = new UpdateUserUseCase(repository);

    await expect(
      sut.execute({
        userId: 'admin-1',
        actorId: 'admin-1',
        role: UsuarioRole.ANALISTA
      })
    ).rejects.toMatchObject({
      message: 'Você não pode alterar a própria permissão',
      statusCode: 403
    });
  });

  it('deve retornar sem alteração quando a role é a mesma', async () => {
    const repository = makeRepository();
    const sut = new UpdateUserUseCase(repository);
    const user = makeUser();

    repository.findById.mockResolvedValue(user);

    const result = await sut.execute({
      userId: user.id,
      actorId: 'admin-1',
      role: UsuarioRole.ANALISTA
    });

    expect(repository.update).not.toHaveBeenCalled();
    expect(result).toEqual({ user, changed: false });
  });
});
