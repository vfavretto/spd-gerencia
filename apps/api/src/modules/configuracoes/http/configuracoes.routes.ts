import { Router } from 'express';
import { ConfiguracoesController } from './configuracoes.controller';

const controller = new ConfiguracoesController();

export const configuracoesRoutes = Router();

configuracoesRoutes.get('/secretarias', controller.listarSecretarias.bind(controller));
configuracoesRoutes.post('/secretarias', controller.criarSecretaria.bind(controller));
configuracoesRoutes.put('/secretarias/:id', controller.atualizarSecretaria.bind(controller));
configuracoesRoutes.delete('/secretarias/:id', controller.removerSecretaria.bind(controller));

configuracoesRoutes.get('/orgaos', controller.listarOrgaos.bind(controller));
configuracoesRoutes.post('/orgaos', controller.criarOrgao.bind(controller));
configuracoesRoutes.put('/orgaos/:id', controller.atualizarOrgao.bind(controller));
configuracoesRoutes.delete('/orgaos/:id', controller.removerOrgao.bind(controller));

configuracoesRoutes.get('/programas', controller.listarProgramas.bind(controller));
configuracoesRoutes.post('/programas', controller.criarPrograma.bind(controller));
configuracoesRoutes.put('/programas/:id', controller.atualizarPrograma.bind(controller));
configuracoesRoutes.delete('/programas/:id', controller.removerPrograma.bind(controller));

configuracoesRoutes.get('/fontes', controller.listarFontes.bind(controller));
configuracoesRoutes.post('/fontes', controller.criarFonte.bind(controller));
configuracoesRoutes.put('/fontes/:id', controller.atualizarFonte.bind(controller));
configuracoesRoutes.delete('/fontes/:id', controller.removerFonte.bind(controller));
