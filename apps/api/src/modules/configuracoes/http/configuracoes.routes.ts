import { Router } from 'express';
import { ConfiguracoesController } from './configuracoes.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ConfiguracoesController();

export const configuracoesRoutes = Router();

// Secretarias - GET para todos, demais apenas ADMIN
configuracoesRoutes.get('/secretarias', asyncHandler(controller.listarSecretarias.bind(controller)));
configuracoesRoutes.post('/secretarias', ensureRole('ADMIN'), asyncHandler(controller.criarSecretaria.bind(controller)));
configuracoesRoutes.put('/secretarias/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarSecretaria.bind(controller)));
configuracoesRoutes.delete('/secretarias/:id', ensureRole('ADMIN'), asyncHandler(controller.removerSecretaria.bind(controller)));

// Órgãos - GET para todos, demais apenas ADMIN
configuracoesRoutes.get('/orgaos', asyncHandler(controller.listarOrgaos.bind(controller)));
configuracoesRoutes.post('/orgaos', ensureRole('ADMIN'), asyncHandler(controller.criarOrgao.bind(controller)));
configuracoesRoutes.put('/orgaos/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarOrgao.bind(controller)));
configuracoesRoutes.delete('/orgaos/:id', ensureRole('ADMIN'), asyncHandler(controller.removerOrgao.bind(controller)));

// Programas - GET para todos, demais apenas ADMIN
configuracoesRoutes.get('/programas', asyncHandler(controller.listarProgramas.bind(controller)));
configuracoesRoutes.post('/programas', ensureRole('ADMIN'), asyncHandler(controller.criarPrograma.bind(controller)));
configuracoesRoutes.put('/programas/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarPrograma.bind(controller)));
configuracoesRoutes.delete('/programas/:id', ensureRole('ADMIN'), asyncHandler(controller.removerPrograma.bind(controller)));

// Fontes - GET para todos, demais apenas ADMIN
configuracoesRoutes.get('/fontes', asyncHandler(controller.listarFontes.bind(controller)));
configuracoesRoutes.post('/fontes', ensureRole('ADMIN'), asyncHandler(controller.criarFonte.bind(controller)));
configuracoesRoutes.put('/fontes/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarFonte.bind(controller)));
configuracoesRoutes.delete('/fontes/:id', ensureRole('ADMIN'), asyncHandler(controller.removerFonte.bind(controller)));
