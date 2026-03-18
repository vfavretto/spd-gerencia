import { Router } from 'express';
import { AgendaController } from './agenda.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new AgendaController();

export const agendaRoutes = Router();

agendaRoutes.get('/eventos', asyncHandler(controller.index.bind(controller)));
agendaRoutes.get('/eventos/:id', asyncHandler(controller.show.bind(controller)));

agendaRoutes.post('/eventos', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
agendaRoutes.put('/eventos/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

agendaRoutes.delete('/eventos/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
