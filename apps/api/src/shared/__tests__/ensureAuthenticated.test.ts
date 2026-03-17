import { AppError } from '@shared/errors/AppError';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const mockFindById = jest.fn();

jest.mock('../../modules/auth/repositories/implementations/PrismaUserRepository', () => ({
  PrismaUserRepository: jest.fn().mockImplementation(() => ({
    findById: mockFindById
  }))
}));

jest.mock('@config/env', () => ({
  env: { jwtSecret: 'test-secret' }
}));

import jwt from 'jsonwebtoken';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const makeReq = (overrides: Record<string, unknown> = {}) =>
  ({
    headers: {},
    ...overrides
  }) as any;

const makeRes = () => ({}) as any;

const makeNext = () => jest.fn();

describe('ensureAuthenticated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar com token válido e definir req.user com dados atuais do banco', async () => {
    const payload = { sub: 'user-1', email: 'joao@example.com', role: 'ADMIN', nome: 'João' };
    (jwt.verify as jest.Mock).mockReturnValue(payload);
    mockFindById.mockResolvedValue({
      id: 'user-1',
      nome: 'João Atualizado',
      email: 'atualizado@example.com',
      role: 'ANALISTA',
      ativo: true
    });

    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    const res = makeRes();
    const next = makeNext();

    await ensureAuthenticated(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(mockFindById).toHaveBeenCalledWith('user-1');
    expect(req.user).toEqual({
      id: 'user-1',
      email: 'atualizado@example.com',
      role: 'ANALISTA',
      nome: 'João Atualizado'
    });
    expect(next).toHaveBeenCalled();
  });

  it('deve lançar AppError 401 quando não há header authorization', () => {
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    ensureAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect((next.mock.calls[0]?.[0] as AppError).message).toBe('Token não informado');
  });

  it('deve lançar AppError 401 quando o token é inválido', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = makeReq({ headers: { authorization: 'Bearer invalid-token' } });
    const res = makeRes();
    const next = makeNext();

    ensureAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect((next.mock.calls[0]?.[0] as AppError).message).toBe('Token inválido ou expirado');
  });

  it('deve bloquear usuário inativo', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user-1' });
    mockFindById.mockResolvedValue({
      id: 'user-1',
      nome: 'João',
      email: 'joao@example.com',
      role: 'ADMIN',
      ativo: false
    });

    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    const res = makeRes();
    const next = makeNext();

    await ensureAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect((next.mock.calls[0]?.[0] as AppError).message).toBe(
      'Usuário desativado. Contate o administrador.'
    );
  });
});
