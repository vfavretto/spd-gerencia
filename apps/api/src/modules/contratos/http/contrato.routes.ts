import { Router } from 'express';
import { ContratoController } from './contrato.controller';

const controller = new ContratoController();

export const contratoRoutes = Router({ mergeParams: true });

contratoRoutes.get('/', controller.index.bind(controller));
contratoRoutes.get('/:id', controller.show.bind(controller));
contratoRoutes.post('/', controller.create.bind(controller));
contratoRoutes.put('/:id', controller.update.bind(controller));
contratoRoutes.delete('/:id', controller.remove.bind(controller));

