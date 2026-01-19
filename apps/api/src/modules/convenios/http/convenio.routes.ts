import { Router } from 'express';
import { ConvenioController } from './convenio.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new ConvenioController();

export const convenioRoutes = Router();

convenioRoutes.get('/', asyncHandler(controller.index.bind(controller)));
convenioRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
convenioRoutes.get('/:id/valores-vigentes', asyncHandler(controller.valoresVigentes.bind(controller)));
convenioRoutes.post('/', asyncHandler(controller.create.bind(controller)));
convenioRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
convenioRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));
