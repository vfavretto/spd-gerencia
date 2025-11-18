import { Router } from 'express';
import { authRoutes } from './auth/http/auth.routes';
import { convenioRoutes } from './convenios/http/convenio.routes';
import { dashboardRoutes } from './dashboard/http/dashboard.routes';
import { comunicadoRoutes } from './comunicados/http/comunicado.routes';
import { agendaRoutes } from './agenda/http/agenda.routes';
import { configuracoesRoutes } from './configuracoes/http/configuracoes.routes';
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
