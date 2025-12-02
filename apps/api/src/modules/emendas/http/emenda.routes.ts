import { Router } from 'express';
import { EmendaController } from './emenda.controller';

const controller = new EmendaController();

export const emendaRoutes = Router({ mergeParams: true });

emendaRoutes.get('/', controller.index.bind(controller));
emendaRoutes.get('/:id', controller.show.bind(controller));
emendaRoutes.post('/', controller.create.bind(controller));
emendaRoutes.put('/:id', controller.update.bind(controller));
emendaRoutes.delete('/:id', controller.remove.bind(controller));

