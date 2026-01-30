import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export type Role = 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO' | 'OBSERVADOR';

/**
 * Middleware para verificar se o usuário possui uma das roles permitidas.
 * Deve ser usado APÓS o middleware ensureAuthenticated.
 * 
 * @param allowedRoles - Lista de roles que têm permissão para acessar a rota
 * @returns Middleware Express
 * 
 * @example
 * // Apenas ADMIN pode acessar
 * router.delete('/:id', ensureRole('ADMIN'), controller.delete);
 * 
 * // ADMIN e ANALISTA podem acessar
 * router.post('/', ensureRole('ADMIN', 'ANALISTA'), controller.create);
 */
export const ensureRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (!allowedRoles.includes(userRole)) {
      throw new AppError('Acesso não autorizado para esta operação', 403);
    }

    return next();
  };
};

/**
 * Middleware que permite acesso apenas para leitura (GET).
 * Útil para rotas que devem ser acessíveis por todos os usuários autenticados,
 * mas apenas para operações de leitura.
 */
export const ensureReadOnly = (req: Request, _res: Response, next: NextFunction) => {
  const userRole = req.user?.role as Role;

  if (userRole === 'OBSERVADOR' && req.method !== 'GET') {
    throw new AppError('Observadores podem apenas visualizar dados', 403);
  }

  return next();
};
