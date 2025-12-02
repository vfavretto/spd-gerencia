import { Router } from 'express';
import { MedicaoController } from './medicao.controller';

const controller = new MedicaoController();

export const medicaoRoutes = Router({ mergeParams: true });

medicaoRoutes.get('/', controller.index.bind(controller));
medicaoRoutes.get('/saldo', controller.saldo.bind(controller));
medicaoRoutes.get('/:id', controller.show.bind(controller));
medicaoRoutes.post('/', controller.create.bind(controller));
medicaoRoutes.put('/:id', controller.update.bind(controller));
medicaoRoutes.delete('/:id', controller.remove.bind(controller));

