import { Router } from 'express';
import { authRoutes } from './auth/http/auth.routes';
import { convenioRoutes } from './convenios/http/convenio.routes';
import { dashboardRoutes } from './dashboard/http/dashboard.routes';
import { comunicadoRoutes } from './comunicados/http/comunicado.routes';
import { agendaRoutes } from './agenda/http/agenda.routes';
import { configuracoesRoutes } from './configuracoes/http/configuracoes.routes';
import { emendaRoutes } from './emendas/http/emenda.routes';
import { financeiroRoutes } from './financeiro/http/financeiro.routes';
import { contratoRoutes } from './contratos/http/contrato.routes';
import { medicaoRoutes } from './medicoes/http/medicao.routes';
import { pendenciaRoutes } from './pendencias/http/pendencia.routes';
import { aditivoRoutes } from './aditivos/http/aditivo.routes';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

routes.use('/auth', authRoutes);
routes.use(ensureAuthenticated);
routes.use('/convenios', convenioRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/comunicados', comunicadoRoutes);
routes.use('/agenda', agendaRoutes);
routes.use('/configuracoes', configuracoesRoutes);

// Rotas aninhadas de convênios
routes.use('/convenios/:convenioId/emendas', emendaRoutes);
routes.use('/convenios/:convenioId/financeiro', financeiroRoutes);
routes.use('/convenios/:convenioId/contratos', contratoRoutes);
routes.use('/convenios/:convenioId/pendencias', pendenciaRoutes);
routes.use('/convenios/:convenioId/aditivos', aditivoRoutes);

// Rotas aninhadas de contratos
routes.use('/contratos/:contratoId/medicoes', medicaoRoutes);
