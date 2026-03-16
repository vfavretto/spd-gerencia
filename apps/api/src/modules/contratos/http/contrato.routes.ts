import { Router } from 'express';
import { ContratoController } from './contrato.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ContratoController();

export const contratoRoutes = Router({ mergeParams: true });

contratoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
contratoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

contratoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
contratoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

contratoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

