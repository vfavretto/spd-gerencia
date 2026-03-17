import { AppError } from '@shared/errors/AppError';
import { RegisterUserUseCase } from '../useCases/RegisterUserUseCase';
import type { UserRepository } from '../repositories/UserRepository';
import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@spd/db';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password'))
}));

import bcrypt from 'bcryptjs';

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

describe('RegisterUserUseCase', () => {
  let sut: RegisterUserUseCase;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new RegisterUserUseCase(repository);
  });

  it('deve registrar um novo usuário com sucesso', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.findByMatricula.mockResolvedValue(null);

    const createdUser = makeUser();
    repository.create.mockResolvedValue(createdUser);

    const result = await sut.execute({
      nome: 'Maria Souza',
      email: 'maria@example.com',
      matricula: '54321',
      senha: 'senha123'
    });

    expect(repository.findByEmail).toHaveBeenCalledWith('maria@example.com');
    expect(repository.findByMatricula).toHaveBeenCalledWith('54321');
    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    expect(repository.create).toHaveBeenCalledWith({
      nome: 'Maria Souza',
      email: 'maria@example.com',
      matricula: '54321',
      senha: 'hashed-password',
      role: 'ANALISTA'
    });
    expect(result).toEqual({
      id: createdUser.id,
      nome: createdUser.nome,
      email: createdUser.email,
      matricula: createdUser.matricula,
      role: createdUser.role
    });
  });

  it('deve lançar erro ao tentar registrar e-mail duplicado', async () => {
    repository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      sut.execute({
        nome: 'Maria Souza',
        email: 'maria@example.com',
        matricula: '99999',
        senha: 'senha123'
      })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Já existe um usuário com este e-mail',
      statusCode: 409
    }));

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao tentar registrar matrícula duplicada', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.findByMatricula.mockResolvedValue(makeUser());

    await expect(
      sut.execute({
        nome: 'Maria Souza',
        email: 'outra@example.com',
        matricula: '54321',
        senha: 'senha123'
      })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Já existe um usuário com esta matrícula',
      statusCode: 409
    }));

    expect(repository.create).not.toHaveBeenCalled();
  });
});
