import { asyncHandler } from '../middlewares/asyncHandler';

const makeReq = () => ({}) as any;

const makeRes = () => ({}) as any;

const makeNext = () => jest.fn();

describe('asyncHandler', () => {
  it('deve executar o handler sem erro e não chamar next com erro', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve capturar erro assíncrono e passar para next', async () => {
    const error = new Error('async failure');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
