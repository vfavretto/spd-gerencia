import { Router } from 'express';
import { ConfiguracoesController } from './configuracoes.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';

const controller = new ConfiguracoesController();

export const configuracoesRoutes = Router();

configuracoesRoutes.get('/secretarias', asyncHandler(controller.listarSecretarias.bind(controller)));
configuracoesRoutes.post('/secretarias', asyncHandler(controller.criarSecretaria.bind(controller)));
configuracoesRoutes.put('/secretarias/:id', asyncHandler(controller.atualizarSecretaria.bind(controller)));
configuracoesRoutes.delete('/secretarias/:id', asyncHandler(controller.removerSecretaria.bind(controller)));

configuracoesRoutes.get('/orgaos', asyncHandler(controller.listarOrgaos.bind(controller)));
configuracoesRoutes.post('/orgaos', asyncHandler(controller.criarOrgao.bind(controller)));
configuracoesRoutes.put('/orgaos/:id', asyncHandler(controller.atualizarOrgao.bind(controller)));
configuracoesRoutes.delete('/orgaos/:id', asyncHandler(controller.removerOrgao.bind(controller)));

configuracoesRoutes.get('/programas', asyncHandler(controller.listarProgramas.bind(controller)));
configuracoesRoutes.post('/programas', asyncHandler(controller.criarPrograma.bind(controller)));
configuracoesRoutes.put('/programas/:id', asyncHandler(controller.atualizarPrograma.bind(controller)));
configuracoesRoutes.delete('/programas/:id', asyncHandler(controller.removerPrograma.bind(controller)));

configuracoesRoutes.get('/fontes', asyncHandler(controller.listarFontes.bind(controller)));
configuracoesRoutes.post('/fontes', asyncHandler(controller.criarFonte.bind(controller)));
configuracoesRoutes.put('/fontes/:id', asyncHandler(controller.atualizarFonte.bind(controller)));
configuracoesRoutes.delete('/fontes/:id', asyncHandler(controller.removerFonte.bind(controller)));
