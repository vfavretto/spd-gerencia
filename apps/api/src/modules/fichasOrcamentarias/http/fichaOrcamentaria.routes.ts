import { Router } from 'express';
import { FichaOrcamentariaController } from './fichaOrcamentaria.controller';

const controller = new FichaOrcamentariaController();

export const fichaOrcamentariaRoutes = Router({ mergeParams: true });

fichaOrcamentariaRoutes.get('/', controller.index.bind(controller));
fichaOrcamentariaRoutes.get('/:id', controller.show.bind(controller));
fichaOrcamentariaRoutes.post('/', controller.create.bind(controller));
fichaOrcamentariaRoutes.put('/:id', controller.update.bind(controller));
fichaOrcamentariaRoutes.delete('/:id', controller.remove.bind(controller));
