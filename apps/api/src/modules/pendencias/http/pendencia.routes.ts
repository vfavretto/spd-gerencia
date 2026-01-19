import { Router } from 'express';
import { PendenciaController } from './pendencia.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

export const pendenciaRoutes = Router({ mergeParams: true });
const controller = new PendenciaController();

pendenciaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
pendenciaRoutes.get('/count', asyncHandler(controller.countByStatus.bind(controller)));
pendenciaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
pendenciaRoutes.post('/', asyncHandler(controller.create.bind(controller)));
pendenciaRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
pendenciaRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

