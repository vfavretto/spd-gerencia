import { Router } from 'express';
import { AgendaController } from './agenda.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new AgendaController();

export const agendaRoutes = Router();

agendaRoutes.get('/eventos', asyncHandler(controller.index.bind(controller)));
agendaRoutes.get('/eventos/:id', asyncHandler(controller.show.bind(controller)));
agendaRoutes.post('/eventos', asyncHandler(controller.create.bind(controller)));
agendaRoutes.put('/eventos/:id', asyncHandler(controller.update.bind(controller)));
agendaRoutes.delete('/eventos/:id', asyncHandler(controller.remove.bind(controller)));
