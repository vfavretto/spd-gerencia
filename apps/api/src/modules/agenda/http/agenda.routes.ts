import { Router } from 'express';
import { AgendaController } from './agenda.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new AgendaController();

export const agendaRoutes = Router();

// GET - todos os usuários autenticados podem ler
agendaRoutes.get('/eventos', asyncHandler(controller.index.bind(controller)));
agendaRoutes.get('/eventos/:id', asyncHandler(controller.show.bind(controller)));

// POST/PUT - apenas ADMIN e ANALISTA
agendaRoutes.post('/eventos', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.create.bind(controller)));
agendaRoutes.put('/eventos/:id', ensureRole('ADMIN', 'ANALISTA'), asyncHandler(controller.update.bind(controller)));

// DELETE - apenas ADMIN
agendaRoutes.delete('/eventos/:id', ensureRole('ADMIN'), asyncHandler(controller.remove.bind(controller)));
