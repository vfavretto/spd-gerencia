import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post('/login', asyncHandler(controller.login.bind(controller)));
