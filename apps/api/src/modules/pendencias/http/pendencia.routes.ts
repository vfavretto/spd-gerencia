import { Router } from 'express';
import { PendenciaController } from './pendencia.controller';

const controller = new PendenciaController();

export const pendenciaRoutes = Router({ mergeParams: true });

pendenciaRoutes.get('/', controller.index.bind(controller));
pendenciaRoutes.get('/count', controller.countByStatus.bind(controller));
pendenciaRoutes.get('/:id', controller.show.bind(controller));
pendenciaRoutes.post('/', controller.create.bind(controller));
pendenciaRoutes.put('/:id', controller.update.bind(controller));
pendenciaRoutes.delete('/:id', controller.remove.bind(controller));

