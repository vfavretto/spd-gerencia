import { Router } from 'express';
import { AuditoriaController } from './auditoria.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new AuditoriaController();

export const auditoriaRoutes = Router();

// Apenas ADMIN pode acessar os logs de auditoria
auditoriaRoutes.get('/', ensureRole('ADMIN'), asyncHandler(controller.index.bind(controller)));
auditoriaRoutes.get('/:id', ensureRole('ADMIN'), asyncHandler(controller.show.bind(controller)));
auditoriaRoutes.get('/entidade/:entidade/:entidadeId', ensureRole('ADMIN'), asyncHandler(controller.byEntidade.bind(controller)));
