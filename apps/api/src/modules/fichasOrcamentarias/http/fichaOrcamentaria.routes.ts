import { Router } from 'express';
import { FichaOrcamentariaController } from './fichaOrcamentaria.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new FichaOrcamentariaController();

export const fichaOrcamentariaRoutes = Router({ mergeParams: true });

fichaOrcamentariaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
fichaOrcamentariaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

fichaOrcamentariaRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
fichaOrcamentariaRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

fichaOrcamentariaRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
