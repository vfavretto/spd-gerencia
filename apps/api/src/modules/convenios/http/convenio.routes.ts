import { Router } from 'express';
import { ConvenioController } from './convenio.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ConvenioController();

export const convenioRoutes = Router();

// GET - todos os usuários autenticados podem ler
convenioRoutes.get('/', asyncHandler(controller.index.bind(controller)));
convenioRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
convenioRoutes.get('/:id/valores-vigentes', asyncHandler(controller.valoresVigentes.bind(controller)));

// POST/PUT - apenas ADMIN e ANALISTA
convenioRoutes.post('/', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
convenioRoutes.put('/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));
convenioRoutes.post('/:id/concluir', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.concluir.bind(controller)));
convenioRoutes.post('/:id/cancelar', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.cancelar.bind(controller)));

// DELETE - apenas ADMIN
convenioRoutes.delete('/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
