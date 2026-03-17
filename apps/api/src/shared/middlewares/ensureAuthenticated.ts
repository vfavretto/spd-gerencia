import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '../errors/AppError';
import { PrismaUserRepository } from '../../modules/auth/repositories/implementations/PrismaUserRepository';

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  nome: string;
};

export const ensureAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Token não informado', 401));
  }

  const [, token] = authHeader.split(' ');

  const repository = new PrismaUserRepository();

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;

    return repository.findById(decoded.sub)
      .then((user) => {
        if (!user) {
          throw new AppError('Usuário não encontrado', 401);
        }

        if (!user.ativo) {
          throw new AppError('Usuário desativado. Contate o administrador.', 401);
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          nome: user.nome
        };

        return next();
      })
      .catch((error) => next(error));
  } catch {
    return next(new AppError('Token inválido ou expirado', 401));
  }
};
