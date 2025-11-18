import { Router } from 'express';
import { ComunicadoController } from './comunicado.controller';

const controller = new ComunicadoController();

export const comunicadoRoutes = Router();

comunicadoRoutes.get('/', controller.index.bind(controller));
comunicadoRoutes.get('/:id', controller.show.bind(controller));
comunicadoRoutes.post('/', controller.create.bind(controller));
comunicadoRoutes.put('/:id', controller.update.bind(controller));
comunicadoRoutes.delete('/:id', controller.remove.bind(controller));
