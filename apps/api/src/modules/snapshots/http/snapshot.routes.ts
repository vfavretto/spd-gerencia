import { Router } from 'express';
import { SnapshotController } from './snapshot.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new SnapshotController();

export const snapshotRoutes = Router({ mergeParams: true });

// Lista todos os snapshots de um convênio
snapshotRoutes.get('/', asyncHandler(controller.index.bind(controller)));

// Compara duas versões de um convênio
snapshotRoutes.get('/compare', asyncHandler(controller.compare.bind(controller)));

// Busca snapshot por versão
snapshotRoutes.get('/versao/:versao', asyncHandler(controller.showByVersao.bind(controller)));

// Busca snapshot por ID
snapshotRoutes.get('/:id', asyncHandler(controller.show.bind(controller)));
