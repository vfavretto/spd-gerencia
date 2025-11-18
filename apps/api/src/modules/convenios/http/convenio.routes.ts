import { Router } from 'express';
import { ConvenioController } from './convenio.controller';

const controller = new ConvenioController();

export const convenioRoutes = Router();

convenioRoutes.get('/', controller.index.bind(controller));
convenioRoutes.get('/:id', controller.show.bind(controller));
convenioRoutes.post('/', controller.create.bind(controller));
convenioRoutes.put('/:id', controller.update.bind(controller));
convenioRoutes.delete('/:id', controller.remove.bind(controller));
