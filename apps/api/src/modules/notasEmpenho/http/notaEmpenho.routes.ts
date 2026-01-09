import { Router } from 'express';
import { NotaEmpenhoController } from './notaEmpenho.controller';

const controller = new NotaEmpenhoController();

export const notaEmpenhoRoutes = Router({ mergeParams: true });

notaEmpenhoRoutes.get('/', controller.index.bind(controller));
notaEmpenhoRoutes.get('/:id', controller.show.bind(controller));
notaEmpenhoRoutes.post('/', controller.create.bind(controller));
notaEmpenhoRoutes.put('/:id', controller.update.bind(controller));
notaEmpenhoRoutes.delete('/:id', controller.remove.bind(controller));
