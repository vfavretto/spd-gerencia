import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new FinanceiroController();

export const financeiroRoutes = Router({ mergeParams: true });

financeiroRoutes.get('/', asyncHandler(controller.show.bind(controller)));
financeiroRoutes.put('/', asyncHandler(controller.upsert.bind(controller)));
financeiroRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

