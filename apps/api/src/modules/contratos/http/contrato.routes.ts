import { Router } from 'express';
import { ContratoController } from './contrato.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new ContratoController();

export const contratoRoutes = Router({ mergeParams: true });

contratoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
contratoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
contratoRoutes.post('/', asyncHandler(controller.create.bind(controller)));
contratoRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
contratoRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

