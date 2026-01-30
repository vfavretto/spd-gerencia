import { Router } from 'express';
import { NotaEmpenhoController } from './notaEmpenho.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new NotaEmpenhoController();

export const notaEmpenhoRoutes = Router({ mergeParams: true });

// GET - todos os usuários autenticados podem ler
notaEmpenhoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
notaEmpenhoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

// POST/PUT - apenas ADMIN e ANALISTA
notaEmpenhoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
notaEmpenhoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

// DELETE - apenas ADMIN
notaEmpenhoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
