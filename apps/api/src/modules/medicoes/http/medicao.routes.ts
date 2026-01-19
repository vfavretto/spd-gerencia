import { Router } from 'express';
import { MedicaoController } from './medicao.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new MedicaoController();

export const medicaoRoutes = Router({ mergeParams: true });

medicaoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
medicaoRoutes.get('/saldo', asyncHandler(controller.saldo.bind(controller)));
medicaoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
medicaoRoutes.post('/', asyncHandler(controller.create.bind(controller)));
medicaoRoutes.put('/:id', asyncHandler(controller.update.bind(controller)));
medicaoRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));

