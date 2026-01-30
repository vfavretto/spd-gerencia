import { Router } from 'express';
import { ComunicadoController } from './comunicado.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ComunicadoController();

export const comunicadoRoutes = Router();

// GET - todos os usuários autenticados podem ler
comunicadoRoutes.get('/', asyncHandler(controller.index.bind(controller)));
comunicadoRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));

// POST/PUT - ADMIN, ANALISTA e ESTAGIARIO
comunicadoRoutes.post('/', ensureRole('ADMIN', 'ANALISTA', 'ESTAGIARIO'), asyncHandler(controller.create.bind(controller)));
comunicadoRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA', 'ESTAGIARIO'), asyncHandler(controller.update.bind(controller)));

// DELETE - apenas ADMIN e ANALISTA
comunicadoRoutes.delete('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.remove.bind(controller)));
