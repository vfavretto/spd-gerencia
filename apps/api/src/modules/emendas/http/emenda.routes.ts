import { Router } from 'express';
import { EmendaController } from './emenda.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new EmendaController();

export const emendaRoutes = Router({ mergeParams: true });

emendaRoutes.get('/', asyncHandler(controller.index.bind(controller)));
emendaRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
emendaRoutes.post('/', asyncHandler(controller.create.bind(controller)));
emendaRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
emendaRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

