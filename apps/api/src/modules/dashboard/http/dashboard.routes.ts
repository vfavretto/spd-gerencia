import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.get('/overview', controller.overview.bind(controller));
