import { Router } from 'express';
import { AgendaController } from './agenda.controller';

const controller = new AgendaController();

export const agendaRoutes = Router();

agendaRoutes.get('/eventos', controller.index.bind(controller));
agendaRoutes.get('/eventos/:id', controller.show.bind(controller));
agendaRoutes.post('/eventos', controller.create.bind(controller));
agendaRoutes.put('/eventos/:id', controller.update.bind(controller));
agendaRoutes.delete('/eventos/:id', controller.remove.bind(controller));
