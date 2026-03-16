import { Router } from 'express';
import { ConfiguracoesController } from './configuracoes.controller';
import { asyncHandler } from '@shared/middlewares/asyncHandler';
import { ensureRole } from '@shared/middlewares/ensureRole';

const controller = new ConfiguracoesController();

export const configuracoesRoutes = Router();

configuracoesRoutes.get('/secretarias', asyncHandler(controller.listarSecretarias.bind(controller)));
configuracoesRoutes.post('/secretarias', ensureRole('ADMIN'), asyncHandler(controller.criarSecretaria.bind(controller)));
configuracoesRoutes.put('/secretarias/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarSecretaria.bind(controller)));
configuracoesRoutes.delete('/secretarias/:id', ensureRole('ADMIN'), asyncHandler(controller.removerSecretaria.bind(controller)));

configuracoesRoutes.get('/orgaos', asyncHandler(controller.listarOrgaos.bind(controller)));
configuracoesRoutes.post('/orgaos', ensureRole('ADMIN'), asyncHandler(controller.criarOrgao.bind(controller)));
configuracoesRoutes.put('/orgaos/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarOrgao.bind(controller)));
configuracoesRoutes.delete('/orgaos/:id', ensureRole('ADMIN'), asyncHandler(controller.removerOrgao.bind(controller)));

configuracoesRoutes.get('/programas', asyncHandler(controller.listarProgramas.bind(controller)));
configuracoesRoutes.post('/programas', ensureRole('ADMIN'), asyncHandler(controller.criarPrograma.bind(controller)));
configuracoesRoutes.put('/programas/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarPrograma.bind(controller)));
configuracoesRoutes.delete('/programas/:id', ensureRole('ADMIN'), asyncHandler(controller.removerPrograma.bind(controller)));

// Modalidades de Repasse - GET para todos, demais apenas ADMIN
configuracoesRoutes.get('/modalidades-repasse', asyncHandler(controller.listarModalidadesRepasse.bind(controller)));
configuracoesRoutes.post('/modalidades-repasse', ensureRole('ADMIN'), asyncHandler(controller.criarModalidadeRepasse.bind(controller)));
configuracoesRoutes.put('/modalidades-repasse/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarModalidadeRepasse.bind(controller)));
configuracoesRoutes.delete('/modalidades-repasse/:id', ensureRole('ADMIN'), asyncHandler(controller.removerModalidadeRepasse.bind(controller)));

configuracoesRoutes.get('/tipos-termo-formalizacao', asyncHandler(controller.listarTiposTermoFormalizacao.bind(controller)));
configuracoesRoutes.post('/tipos-termo-formalizacao', ensureRole('ADMIN'), asyncHandler(controller.criarTipoTermoFormalizacao.bind(controller)));
configuracoesRoutes.put('/tipos-termo-formalizacao/:id', ensureRole('ADMIN'), asyncHandler(controller.atualizarTipoTermoFormalizacao.bind(controller)));
configuracoesRoutes.delete('/tipos-termo-formalizacao/:id', ensureRole('ADMIN'), asyncHandler(controller.removerTipoTermoFormalizacao.bind(controller)));
