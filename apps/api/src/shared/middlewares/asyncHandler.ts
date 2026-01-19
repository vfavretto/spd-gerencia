import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper para tratar erros assíncronos nas rotas do Express.
 * Express 4.x não captura automaticamente erros de funções async.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
