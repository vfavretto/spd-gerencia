import { createLoginRateLimit } from '../middlewares/loginRateLimit';

type MockResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  on: jest.Mock;
  setHeader: jest.Mock;
  status: jest.Mock;
  json: jest.Mock;
  finish: () => void;
};

const createResponse = () => {
  const listeners = new Map<string, () => void>();

  const response: MockResponse = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as unknown,
    on: jest.fn((event: string, listener: () => void) => {
      listeners.set(event, listener);
      return response;
    }),
    setHeader: jest.fn((key: string, value: string) => {
      response.headers[key] = value;
    }),
    status: jest.fn((code: number) => {
      response.statusCode = code;
      return response;
    }),
    json: jest.fn((payload: unknown) => {
      response.body = payload;
      return response;
    }),
    finish: () => {
      listeners.get('finish')?.();
    }
  };

  return response;
};

describe('loginRateLimit', () => {
  it('bloqueia a sexta tentativa inválida e retorna Retry-After', () => {
    let now = 0;
    const middleware = createLoginRateLimit({
      now: () => now
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const req = {
        ip: '127.0.0.1',
        body: { matricula: '12345' }
      };
      const res = createResponse();
      const next = jest.fn();

      middleware(req as never, res as never, next);
      expect(next).toHaveBeenCalledTimes(1);

      res.statusCode = 401;
      res.finish();
      now += 1000;
    }

    const req = {
      ip: '127.0.0.1',
      body: { matricula: '12345' }
    };
    const res = createResponse();
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
    });
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '899');
  });

  it('limpa o contador após login bem-sucedido', () => {
    let now = 0;
    const middleware = createLoginRateLimit({
      now: () => now
    });

    const failedReq = {
      ip: '127.0.0.1',
      body: { matricula: '12345' }
    };
    const failedRes = createResponse();

    middleware(failedReq as never, failedRes as never, jest.fn());
    failedRes.statusCode = 401;
    failedRes.finish();

    now += 1000;

    const successReq = {
      ip: '127.0.0.1',
      body: { matricula: '12345' }
    };
    const successRes = createResponse();

    middleware(successReq as never, successRes as never, jest.fn());
    successRes.statusCode = 200;
    successRes.finish();

    now += 1000;

    const next = jest.fn();
    const postSuccessReq = {
      ip: '127.0.0.1',
      body: { matricula: '12345' }
    };
    const postSuccessRes = createResponse();

    middleware(postSuccessReq as never, postSuccessRes as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(postSuccessRes.status).not.toHaveBeenCalledWith(429);
  });
});
