import { Router } from 'express';
import { PendenciaController } from './pendencia.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

export const pendenciaRoutes = Router({ mergeParams: true });
const controller = new PendenciaController();

// GET - todos os usuários autenticados podem ler
pendenciaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
pendenciaRoutes.get('/count', asyncHandler(controller.countByStatus.bind(controller)));
pendenciaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

// POST/PUT - apenas ADMIN e ANALISTA
pendenciaRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
pendenciaRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

// DELETE - apenas ADMIN
pendenciaRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

