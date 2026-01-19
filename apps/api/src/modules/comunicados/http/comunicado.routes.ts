import { Router } from 'express';
import { ComunicadoController } from './comunicado.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new ComunicadoController();

export const comunicadoRoutes = Router();

comunicadoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
comunicadoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
comunicadoRoutes.post('/', asyncHandler(controller.create.bind(controller)));
comunicadoRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
comunicadoRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));
