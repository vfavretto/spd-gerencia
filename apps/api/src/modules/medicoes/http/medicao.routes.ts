import { Router } from 'express';
import { MedicaoController } from './medicao.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new MedicaoController();

export const medicaoRoutes = Router({ mergeParams: true });

// GET - todos os usuários autenticados podem ler
medicaoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
medicaoRoutes.get('/saldo', asyncHandler(controller.saldo.bind(controller)));
medicaoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

// POST/PUT - apenas ADMIN e ANALISTA
medicaoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
medicaoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

// DELETE - apenas ADMIN
medicaoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

