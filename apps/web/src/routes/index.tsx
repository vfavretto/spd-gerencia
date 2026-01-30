import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/modules/shared/layouts/DashboardLayout";
import { CalendarioPage } from "@/modules/agenda/pages/CalendarioPage";
import { ComunicadosPage } from "@/modules/comunicados/pages/ComunicadosPage";
import { ConfiguracoesPage } from "@/modules/configuracoes/pages/ConfiguracoesPage";
import { ConveniosCadastroPage } from "@/modules/convenios/pages/ConveniosCadastroPage";
import { ConvenioDetalhesPage } from "@/modules/convenios/pages/ConvenioDetalhesPage";
import { ConveniosListaPage } from "@/modules/convenios/pages/ConveniosListaPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";

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
