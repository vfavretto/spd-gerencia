import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // NextFunction é necessário na assinatura para o Express reconhecer como error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error('[UnhandledError]', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor'
  });
};
