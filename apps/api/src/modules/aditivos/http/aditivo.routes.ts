import { Router } from 'express';
import { AditivoController } from './aditivo.controller';

const controller = new AditivoController();

export const aditivoRoutes = Router({ mergeParams: true });

aditivoRoutes.get('/', controller.index.bind(controller));
aditivoRoutes.get('/vigencia', controller.vigencia.bind(controller));
aditivoRoutes.get('/:id', controller.show.bind(controller));
aditivoRoutes.post('/', controller.create.bind(controller));
aditivoRoutes.put('/:id', controller.update.bind(controller));
aditivoRoutes.delete('/:id', controller.remove.bind(controller));

