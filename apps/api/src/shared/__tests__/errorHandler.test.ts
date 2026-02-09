import { AppError } from '@shared/errors/AppError';
import { errorHandler } from '../middlewares/errorHandler';

const makeReq = () => ({}) as any;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeNext = () => jest.fn();

describe('errorHandler', () => {
  it('deve retornar status e mensagem corretos para AppError', () => {
    const err = new AppError('Recurso não encontrado', 404);
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Recurso não encontrado'
    });
  });

  it('deve retornar 500 com mensagem genérica para erro desconhecido', () => {
    const err = new Error('unexpected crash');
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno no servidor'
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
