import { AppError } from '@shared/errors/AppError';
import { AuthenticateUserUseCase } from '../useCases/AuthenticateUserUseCase';
import type { UserRepository } from '../repositories/UserRepository';
import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@spd/db';

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token')
}));

jest.mock('@config/env', () => ({
  env: { jwtSecret: 'test-secret' }
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const makeUser = (overrides: Partial<IUsuario> = {}): IUsuario => ({
  id: 'user-1',
  nome: 'João Silva',
  email: 'joao@example.com',
  matricula: '12345',
  senha: 'hashed-password',
  role: UsuarioRole.ANALISTA,
  ativo: true,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  ...overrides
});

const makeRepository = (): jest.Mocked<UserRepository> => ({
  findByEmail: jest.fn(),
  findByMatricula: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn()
});

describe('AuthenticateUserUseCase', () => {
  let sut: AuthenticateUserUseCase;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new AuthenticateUserUseCase(repository);
  });

  it('deve autenticar com login válido', async () => {
    const user = makeUser();
    repository.findByMatricula.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await sut.execute({ matricula: '12345', senha: 'senha123' });

    expect(repository.findByMatricula).toHaveBeenCalledWith('12345');
    expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: user.email, role: user.role, matricula: user.matricula, nome: user.nome },
      'test-secret',
      { subject: user.id, expiresIn: '2h' }
    );
    expect(result).toEqual({
      token: 'fake-jwt-token',
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        matricula: user.matricula,
        role: user.role
      }
    });
  });

  it('deve lançar erro para usuário inexistente', async () => {
    repository.findByMatricula.mockResolvedValue(null);

    await expect(
      sut.execute({ matricula: '99999', senha: 'senha123' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Credenciais inválidas',
      statusCode: 401
    }));

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('deve lançar erro para senha incorreta', async () => {
    const user = makeUser();
    repository.findByMatricula.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      sut.execute({ matricula: '12345', senha: 'senha-errada' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Credenciais inválidas',
      statusCode: 401
    }));

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('deve lançar erro para usuário inativo', async () => {
    const user = makeUser({ ativo: false });
    repository.findByMatricula.mockResolvedValue(user);

    await expect(
      sut.execute({ matricula: '12345', senha: 'senha123' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Usuário desativado. Contate o administrador.',
      statusCode: 401
    }));

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
