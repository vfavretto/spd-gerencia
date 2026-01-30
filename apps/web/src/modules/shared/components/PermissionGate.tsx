import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { UsuarioRole } from '@/modules/shared/types';

interface PermissionGateProps {
  /**
   * Lista de roles que têm permissão para ver o conteúdo.
   * Se o usuário tiver qualquer uma das roles listadas, o conteúdo será exibido.
   */
  allowed: UsuarioRole[];
  
  /**
   * Conteúdo a ser exibido se o usuário tiver permissão.
   */
  children: ReactNode;
  
  /**
   * Conteúdo alternativo a ser exibido se o usuário não tiver permissão.
   * Se não fornecido, nada será exibido.
   */
  fallback?: ReactNode;
}

/**
 * Componente que controla a visibilidade de elementos baseado nas permissões do usuário.
 * 
 * @example
 * // Exibe botão apenas para ADMIN e ANALISTA
 * <PermissionGate allowed={['ADMIN', 'ANALISTA']}>
 *   <Button>Criar Convênio</Button>
 * </PermissionGate>
 * 
 * @example
 * // Exibe botão para ADMIN ou mensagem alternativa
 * <PermissionGate 
 *   allowed={['ADMIN']} 
 *   fallback={<span>Sem permissão</span>}
 * >
 *   <Button>Excluir</Button>
 * </PermissionGate>
 */
export const PermissionGate = ({ 
  allowed, 
  children, 
  fallback = null 
}: PermissionGateProps): ReactNode => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  if (!allowed.includes(user.role)) {
    return fallback;
  }

  return children;
};

/**
 * Componente que oculta elementos para observadores.
 * Útil para esconder botões de ação que observadores não podem usar.
 */
export const HideForObserver = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <PermissionGate allowed={['ADMIN', 'ANALISTA', 'ESTAGIARIO']}>
      {children}
    </PermissionGate>
  );
};

/**
 * Componente que exibe elementos apenas para administradores.
 */
export const AdminOnly = ({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}): ReactNode => {
  return (
    <PermissionGate allowed={['ADMIN']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * Componente que exibe elementos para quem pode criar convênios.
 */
export const CanCreateConvenio = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <PermissionGate allowed={['ADMIN', 'ANALISTA']}>
      {children}
    </PermissionGate>
  );
};

/**
 * Componente que exibe elementos para quem pode criar comunicados.
 */
export const CanCreateComunicado = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <PermissionGate allowed={['ADMIN', 'ANALISTA', 'ESTAGIARIO']}>
      {children}
    </PermissionGate>
  );
};
