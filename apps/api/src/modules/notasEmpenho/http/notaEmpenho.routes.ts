import { Router } from 'express';
import { NotaEmpenhoController } from './notaEmpenho.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new NotaEmpenhoController();

export const notaEmpenhoRoutes = Router({ mergeParams: true });

notaEmpenhoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
notaEmpenhoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

notaEmpenhoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
notaEmpenhoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

notaEmpenhoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
