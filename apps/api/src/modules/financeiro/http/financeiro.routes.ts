import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new FinanceiroController();

export const financeiroRoutes = Router({ mergeParams: true });

// GET - todos os usuários autenticados podem ler
financeiroRoutes.get('/', asyncHandler(controller.show.bind(controller)));

// PUT - apenas ADMIN e ANALISTA
financeiroRoutes.put('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.upsert.bind(controller)));

// DELETE - apenas ADMIN
financeiroRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

