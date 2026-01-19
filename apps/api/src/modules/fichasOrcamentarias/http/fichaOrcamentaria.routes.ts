import { Router } from 'express';
import { FichaOrcamentariaController } from './fichaOrcamentaria.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new FichaOrcamentariaController();

export const fichaOrcamentariaRoutes = Router({ mergeParams: true });

fichaOrcamentariaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
fichaOrcamentariaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
fichaOrcamentariaRoutes.post('/', asyncHandler(controller.create.bind(controller)));
fichaOrcamentariaRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
fichaOrcamentariaRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));
