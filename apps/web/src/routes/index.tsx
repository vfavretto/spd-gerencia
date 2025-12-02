import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CalendarioPage } from '../pages/CalendarioPage';
import { ComunicadosPage } from '../pages/ComunicadosPage';
import { ConfiguracoesPage } from '../pages/ConfiguracoesPage';
import { ConveniosCadastroPage } from '../pages/ConveniosCadastroPage';
import { ConvenioDetalhesPage } from '../pages/ConvenioDetalhesPage';
import { ConveniosListaPage } from '../pages/ConveniosListaPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/convenios" element={<ConveniosListaPage />} />
        <Route path="/convenios/cadastrar" element={<ConveniosCadastroPage />} />
        <Route path="/convenios/:id" element={<ConvenioDetalhesPage />} />
        <Route path="/convenios/:id/editar" element={<ConvenioDetalhesPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/comunicados" element={<ComunicadosPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
