import { Router } from 'express';
import { AditivoController } from './aditivo.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new AditivoController();

export const aditivoRoutes = Router({ mergeParams: true });

aditivoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
aditivoRoutes.get('/vigencia', asyncHandler(controller.vigencia.bind(controller)));
aditivoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

aditivoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
aditivoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

aditivoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

