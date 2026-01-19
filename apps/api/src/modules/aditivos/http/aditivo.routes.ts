import { Router } from 'express';
import { AditivoController } from './aditivo.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new AditivoController();

export const aditivoRoutes = Router({ mergeParams: true });

aditivoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
aditivoRoutes.get('/vigencia', asyncHandler(controller.vigencia.bind(controller)));
aditivoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
aditivoRoutes.post('/', asyncHandler(controller.create.bind(controller)));
aditivoRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
aditivoRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

