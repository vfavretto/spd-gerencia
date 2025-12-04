import { Router } from 'express';
import { PendenciaController } from './pendencia.controller';

export const pendenciaRoutes = Router({ mergeParams: true });
const controller = new PendenciaController();

pendenciaRoutes.get('/', (req, res) => controller.index(req, res));
pendenciaRoutes.get('/count', (req, res) => controller.countByStatus(req, res));
pendenciaRoutes.get('/:id', (req, res) => controller.show(req, res));
pendenciaRoutes.post('/', (req, res) => controller.create(req, res));
pendenciaRoutes.put('/:id', (req, res) => controller.update(req, res));
pendenciaRoutes.delete('/:id', (req, res) => controller.remove(req, res));

