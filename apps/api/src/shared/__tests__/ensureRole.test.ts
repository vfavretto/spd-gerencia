import { AppError } from '@shared/errors/AppError';
import { ensureRole } from '../middlewares/ensureRole';

const makeReq = (user?: Record<string, unknown>) =>
  ({ user }) as any;

const makeRes = () => ({}) as any;

const makeNext = () => jest.fn();

describe('ensureRole', () => {
  it('deve chamar next() quando o usuário possui role autorizada', () => {
    const middleware = ensureRole('ADMIN', 'ANALISTA');
    const req = makeReq({ id: 'user-1', email: 'joao@example.com', role: 'ADMIN' });
    const res = makeRes();
    const next = makeNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('deve lançar AppError 403 quando o usuário possui role não autorizada', () => {
    const middleware = ensureRole('ADMIN');
    const req = makeReq({ id: 'user-1', email: 'joao@example.com', role: 'ESTAGIARIO' });
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow(AppError);

    try {
      middleware(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(403);
      expect((err as AppError).message).toBe('Acesso não autorizado para esta operação');
    }

    expect(next).not.toHaveBeenCalled();
  });

  it('deve lançar AppError 401 quando não há usuário na requisição', () => {
    const middleware = ensureRole('ADMIN');
    const req = makeReq(undefined);
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow(AppError);

    try {
      middleware(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe('Usuário não autenticado');
    }

    expect(next).not.toHaveBeenCalled();
  });
});
