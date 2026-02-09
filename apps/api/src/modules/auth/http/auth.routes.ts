import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new AuthController();

export const authRoutes = Router();

// Rota pública
authRoutes.post('/login', asyncHandler(controller.login.bind(controller)));

// Rotas protegidas - apenas ADMIN
authRoutes.post(
  '/register',
  ensureAuthenticated,
  ensureRole('ADMIN'),
  asyncHandler(controller.register.bind(controller))
);

authRoutes.get(
  '/users',
  ensureAuthenticated,
  ensureRole('ADMIN'),
  asyncHandler(controller.listUsers.bind(controller))
);
