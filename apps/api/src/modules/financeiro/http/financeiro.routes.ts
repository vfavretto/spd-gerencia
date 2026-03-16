import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new FinanceiroController();

export const financeiroRoutes = Router({ mergeParams: true });

financeiroRoutes.get('/', asyncHandler(controller.show.bind(controller)));

financeiroRoutes.put('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.upsert.bind(controller)));

financeiroRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

