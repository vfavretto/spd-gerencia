import { useMemo } from "react";
import { useAuth } from "@/modules/auth/context/AuthContext";
import type { UsuarioRole } from "@/modules/shared/types";

type Entity = 
  | "convenio"
  | "comunicado"
  | "configuracao"
  | "contrato"
  | "medicao"
  | "aditivo"
  | "emenda"
  | "financeiro"
  | "pendencia"
  | "fichaOrcamentaria"
  | "notaEmpenho"
  | "evento"
  | "auditoria";

// Matriz de permissões por entidade e ação
const permissionMatrix: Record<Entity, {
  create: UsuarioRole[];
  update: UsuarioRole[];
  delete: UsuarioRole[];
}> = {
  convenio: {
    create: ["ADMIN", "ANALISTA"],
    update: ["ADMIN", "ANALISTA"],
    delete: ["ADMIN"]
  },
  comunicado: {
    create: ["ADMIN", "ANALISTA", "ESTAGIARIO"],
    update: ["ADMIN", "ANALISTA", "ESTAGIARIO"],
    delete: ["ADMIN", "ANALISTA"]
  },
  configuracao: {
    create: ['ADMIN'],
    update: ['ADMIN'],
    delete: ['ADMIN']
  },
  contrato: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  medicao: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  aditivo: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  emenda: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  financeiro: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  pendencia: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  fichaOrcamentaria: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  notaEmpenho: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  evento: {
    create: ['ADMIN', 'ANALISTA'],
    update: ['ADMIN', 'ANALISTA'],
    delete: ['ADMIN']
  },
  auditoria: {
    create: [],
    update: [],
    delete: []
  }
};

export interface UsePermissionsReturn {
  // Verificações por entidade
  canCreate: (entity: Entity) => boolean;
  canUpdate: (entity: Entity) => boolean;
  canDelete: (entity: Entity) => boolean;
  
  // Verificações gerais
  canWrite: (entity: Entity) => boolean;
  
  // Verificações de role
  isAdmin: boolean;
  isAnalista: boolean;
  isEstagiario: boolean;
  isObservador: boolean;
  
  // Role do usuário atual
  userRole: UsuarioRole | undefined;
  
  // Helper para verificar múltiplas roles
  hasRole: (...roles: UsuarioRole[]) => boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  const userRole = user?.role;

  return useMemo(() => {
    const hasRole = (...roles: UsuarioRole[]) => {
      if (!userRole) return false;
      return roles.includes(userRole);
    };

    const canCreate = (entity: Entity) => {
      if (!userRole) return false;
      return permissionMatrix[entity].create.includes(userRole);
    };

    const canUpdate = (entity: Entity) => {
      if (!userRole) return false;
      return permissionMatrix[entity].update.includes(userRole);
    };

    const canDelete = (entity: Entity) => {
      if (!userRole) return false;
      return permissionMatrix[entity].delete.includes(userRole);
    };

    const canWrite = (entity: Entity) => {
      return canCreate(entity) || canUpdate(entity);
    };

    return {
      canCreate,
      canUpdate,
      canDelete,
      canWrite,
      isAdmin: userRole === 'ADMIN',
      isAnalista: userRole === 'ANALISTA',
      isEstagiario: userRole === 'ESTAGIARIO',
      isObservador: userRole === 'OBSERVADOR',
      userRole,
      hasRole
    };
  }, [userRole]);
};
