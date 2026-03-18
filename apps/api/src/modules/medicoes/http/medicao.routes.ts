import { Router } from 'express';
import { MedicaoController } from './medicao.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new MedicaoController();

export const medicaoRoutes = Router({ mergeParams: true });

medicaoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
medicaoRoutes.get('/saldo', asyncHandler(controller.saldo.bind(controller)));
medicaoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

medicaoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
medicaoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

medicaoRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));

