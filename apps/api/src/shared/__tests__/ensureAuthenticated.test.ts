import { AppError } from '@shared/errors/AppError';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
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
  it('deve autenticar com token válido e definir req.user', () => {
    const payload = { sub: 'user-1', email: 'joao@example.com', role: 'ADMIN' };
    (jwt.verify as jest.Mock).mockReturnValue(payload);

    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    const res = makeRes();
    const next = makeNext();

    ensureAuthenticated(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual({
      id: 'user-1',
      email: 'joao@example.com',
      role: 'ADMIN'
    });
    expect(next).toHaveBeenCalled();
  });

  it('deve lançar AppError 401 quando não há header authorization', () => {
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
    expect(() => ensureAuthenticated(req, res, next)).toThrow('Token não informado');

    try {
      ensureAuthenticated(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('deve lançar AppError 401 quando o token é inválido', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = makeReq({ headers: { authorization: 'Bearer invalid-token' } });
    const res = makeRes();
    const next = makeNext();

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);

    try {
      ensureAuthenticated(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe('Token inválido ou expirado');
    }

    expect(next).not.toHaveBeenCalled();
  });
});
