import { Router } from 'express';
import { AuthController } from './auth.controller';

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post('/login', controller.login.bind(controller));
