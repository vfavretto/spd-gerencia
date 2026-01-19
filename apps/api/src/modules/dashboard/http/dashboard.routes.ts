import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.get('/overview', asyncHandler(controller.overview.bind(controller)));
dashboardRoutes.get('/resumo', asyncHandler(controller.resumo.bind(controller)));
