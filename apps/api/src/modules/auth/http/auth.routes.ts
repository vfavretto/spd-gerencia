import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';
import { ensureRole } from '@shared/middlewares/ensureRole';
import { loginRateLimit } from '@shared/middlewares/loginRateLimit';

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post('/login', loginRateLimit, asyncHandler(controller.login.bind(controller)));

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
