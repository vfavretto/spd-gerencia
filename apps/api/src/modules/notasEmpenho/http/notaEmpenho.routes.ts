import { Router } from 'express';
import { NotaEmpenhoController } from './notaEmpenho.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new NotaEmpenhoController();

export const notaEmpenhoRoutes = Router({ mergeParams: true });

notaEmpenhoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
notaEmpenhoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
notaEmpenhoRoutes.post('/', asyncHandler(controller.create.bind(controller)));
notaEmpenhoRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
notaEmpenhoRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));
