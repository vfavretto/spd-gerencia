import { Router } from 'express';
import { EmendaController } from './emenda.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new EmendaController();

export const emendaRoutes = Router({ mergeParams: true });

emendaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
emendaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

emendaRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
emendaRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

emendaRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

