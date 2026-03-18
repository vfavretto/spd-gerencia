import { Router } from 'express';
import { ComunicadoController } from './comunicado.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ComunicadoController();

export const comunicadoRoutes = Router();

comunicadoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
comunicadoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

comunicadoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA', 'ESTAGIARIO'), asyncHandler(controller.create.bind(controller)));
comunicadoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA', 'ESTAGIARIO'), asyncHandler(controller.update.bind(controller)));

comunicadoRoutes.delete('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.remove.bind(controller)));
