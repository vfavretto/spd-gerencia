import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import type { UsuarioRole, User } from "@/modules/shared/types";

// Mock do módulo AuthContext
vi.mock("@/modules/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Importa após o mock para que o módulo mockado seja usado
import { useAuth } from "@/modules/auth/context/AuthContext";
import { usePermissions } from "../usePermissions";

const mockedUseAuth = vi.mocked(useAuth);

function mockUserWithRole(role: UsuarioRole) {
  const user: User = {
    id: "user-1",
    nome: "Teste",
    email: "teste@spd.gov.br",
    matricula: "12345",
    role,
  };
  mockedUseAuth.mockReturnValue({
    user,
    token: "fake-token",
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

function mockNoUser() {
  mockedUseAuth.mockReturnValue({
    user: null,
    token: null,
    isAuthenticated: false,
    initializing: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

describe("usePermissions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== ADMIN ====================
  describe("role ADMIN", () => {
    beforeEach(() => mockUserWithRole("ADMIN"));

    it("isAdmin deve ser true", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isAnalista).toBe(false);
      expect(result.current.isEstagiario).toBe(false);
      expect(result.current.isObservador).toBe(false);
    });

    it("pode criar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("convenio")).toBe(true);
    });

    it("pode editar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canUpdate("convenio")).toBe(true);
    });

    it("pode deletar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("convenio")).toBe(true);
    });

    it("pode criar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("comunicado")).toBe(true);
    });

    it("pode deletar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("comunicado")).toBe(true);
    });

    it("pode gerenciar configurações", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("configuracao")).toBe(true);
      expect(result.current.canUpdate("configuracao")).toBe(true);
      expect(result.current.canDelete("configuracao")).toBe(true);
    });

    it("canWrite retorna true para convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWrite("convenio")).toBe(true);
    });

    it("hasRole funciona corretamente", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasRole("ADMIN")).toBe(true);
      expect(result.current.hasRole("ANALISTA")).toBe(false);
      expect(result.current.hasRole("ADMIN", "ANALISTA")).toBe(true);
    });

    it("ninguém pode criar/editar/deletar auditoria", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("auditoria")).toBe(false);
      expect(result.current.canUpdate("auditoria")).toBe(false);
      expect(result.current.canDelete("auditoria")).toBe(false);
    });
  });

  // ==================== ANALISTA ====================
  describe("role ANALISTA", () => {
    beforeEach(() => mockUserWithRole("ANALISTA"));

    it("isAnalista deve ser true", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAnalista).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it("pode criar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("convenio")).toBe(true);
    });

    it("pode editar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canUpdate("convenio")).toBe(true);
    });

    it("NÃO pode deletar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("convenio")).toBe(false);
    });

    it("pode criar e editar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("comunicado")).toBe(true);
      expect(result.current.canUpdate("comunicado")).toBe(true);
    });

    it("pode deletar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("comunicado")).toBe(true);
    });

    it("NÃO pode gerenciar configurações", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("configuracao")).toBe(false);
      expect(result.current.canUpdate("configuracao")).toBe(false);
      expect(result.current.canDelete("configuracao")).toBe(false);
    });

    it("canWrite retorna true para convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWrite("convenio")).toBe(true);
    });

    it("pode criar contratos, medições e aditivos", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("contrato")).toBe(true);
      expect(result.current.canCreate("medicao")).toBe(true);
      expect(result.current.canCreate("aditivo")).toBe(true);
    });
  });

  // ==================== ESTAGIARIO ====================
  describe("role ESTAGIARIO", () => {
    beforeEach(() => mockUserWithRole("ESTAGIARIO"));

    it("isEstagiario deve ser true", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isEstagiario).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isAnalista).toBe(false);
    });

    it("NÃO pode criar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("convenio")).toBe(false);
    });

    it("NÃO pode editar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canUpdate("convenio")).toBe(false);
    });

    it("NÃO pode deletar convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("convenio")).toBe(false);
    });

    it("pode criar e editar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("comunicado")).toBe(true);
      expect(result.current.canUpdate("comunicado")).toBe(true);
    });

    it("NÃO pode deletar comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("comunicado")).toBe(false);
    });

    it("NÃO pode criar contratos", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("contrato")).toBe(false);
    });

    it("canWrite retorna false para convênios", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWrite("convenio")).toBe(false);
    });

    it("canWrite retorna true para comunicados", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWrite("comunicado")).toBe(true);
    });
  });

  // ==================== OBSERVADOR ====================
  describe("role OBSERVADOR", () => {
    beforeEach(() => mockUserWithRole("OBSERVADOR"));

    it("isObservador deve ser true", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isObservador).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it("NÃO pode criar nenhuma entidade", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("convenio")).toBe(false);
      expect(result.current.canCreate("comunicado")).toBe(false);
      expect(result.current.canCreate("contrato")).toBe(false);
      expect(result.current.canCreate("medicao")).toBe(false);
      expect(result.current.canCreate("configuracao")).toBe(false);
    });

    it("NÃO pode editar nenhuma entidade", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canUpdate("convenio")).toBe(false);
      expect(result.current.canUpdate("comunicado")).toBe(false);
      expect(result.current.canUpdate("contrato")).toBe(false);
    });

    it("NÃO pode deletar nenhuma entidade", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("convenio")).toBe(false);
      expect(result.current.canDelete("comunicado")).toBe(false);
    });

    it("canWrite retorna false para todas as entidades", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWrite("convenio")).toBe(false);
      expect(result.current.canWrite("comunicado")).toBe(false);
    });

    it("hasRole retorna false para ADMIN", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasRole("ADMIN")).toBe(false);
    });
  });

  // ==================== SEM USUÁRIO ====================
  describe("sem usuário autenticado", () => {
    beforeEach(() => mockNoUser());

    it("todas as flags de role são false", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isAnalista).toBe(false);
      expect(result.current.isEstagiario).toBe(false);
      expect(result.current.isObservador).toBe(false);
    });

    it("userRole é undefined", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.userRole).toBeUndefined();
    });

    it("não pode criar nada", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate("convenio")).toBe(false);
      expect(result.current.canCreate("comunicado")).toBe(false);
    });

    it("não pode editar nada", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canUpdate("convenio")).toBe(false);
    });

    it("não pode deletar nada", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete("convenio")).toBe(false);
    });

    it("hasRole retorna false para qualquer role", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasRole("ADMIN")).toBe(false);
      expect(result.current.hasRole("ANALISTA", "ESTAGIARIO")).toBe(false);
    });
  });
});
