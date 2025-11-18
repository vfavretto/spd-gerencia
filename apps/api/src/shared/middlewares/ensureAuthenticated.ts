import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '../errors/AppError';

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export const ensureAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não informado', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
    return next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
};
