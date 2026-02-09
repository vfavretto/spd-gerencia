import { render, screen } from '@testing-library/react';
import {
  PermissionGate,
  AdminOnly,
  CanCreateConvenio,
  CanCreateComunicado,
  HideForObserver,
} from '../PermissionGate';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { UsuarioRole } from '@/modules/shared/types';

vi.mock('@/modules/auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function mockUser(role: UsuarioRole) {
  mockUseAuth.mockReturnValue({
    user: { id: '1', nome: 'Teste', email: 'teste@spd.gov', matricula: '12345', role },
    token: 'fake-token',
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

function mockNoUser() {
  mockUseAuth.mockReturnValue({
    user: null,
    token: null,
    isAuthenticated: false,
    initializing: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PermissionGate', () => {
  it('renderiza children quando role esta na lista allowed', () => {
    mockUser('ADMIN');

    render(
      <PermissionGate allowed={['ADMIN', 'ANALISTA']}>
        <span>conteudo protegido</span>
      </PermissionGate>,
    );

    expect(screen.getByText('conteudo protegido')).toBeInTheDocument();
  });

  it('nao renderiza quando role nao esta na lista', () => {
    mockUser('OBSERVADOR');

    render(
      <PermissionGate allowed={['ADMIN']}>
        <span>conteudo protegido</span>
      </PermissionGate>,
    );

    expect(screen.queryByText('conteudo protegido')).not.toBeInTheDocument();
  });

  it('renderiza fallback quando role nao autorizada', () => {
    mockUser('ESTAGIARIO');

    render(
      <PermissionGate allowed={['ADMIN']} fallback={<span>sem permissao</span>}>
        <span>conteudo protegido</span>
      </PermissionGate>,
    );

    expect(screen.queryByText('conteudo protegido')).not.toBeInTheDocument();
    expect(screen.getByText('sem permissao')).toBeInTheDocument();
  });

  it('renderiza fallback quando nao ha usuario autenticado', () => {
    mockNoUser();

    render(
      <PermissionGate allowed={['ADMIN']} fallback={<span>faca login</span>}>
        <span>conteudo protegido</span>
      </PermissionGate>,
    );

    expect(screen.queryByText('conteudo protegido')).not.toBeInTheDocument();
    expect(screen.getByText('faca login')).toBeInTheDocument();
  });
});

describe('AdminOnly', () => {
  it('renderiza apenas para ADMIN', () => {
    mockUser('ADMIN');

    render(
      <AdminOnly>
        <span>admin content</span>
      </AdminOnly>,
    );

    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it.each<UsuarioRole>(['ANALISTA', 'ESTAGIARIO', 'OBSERVADOR'])(
    'nao renderiza para %s',
    (role) => {
      mockUser(role);

      render(
        <AdminOnly>
          <span>admin content</span>
        </AdminOnly>,
      );

      expect(screen.queryByText('admin content')).not.toBeInTheDocument();
    },
  );
});

describe('CanCreateConvenio', () => {
  it.each<UsuarioRole>(['ADMIN', 'ANALISTA'])(
    'renderiza para %s',
    (role) => {
      mockUser(role);

      render(
        <CanCreateConvenio>
          <span>criar convenio</span>
        </CanCreateConvenio>,
      );

      expect(screen.getByText('criar convenio')).toBeInTheDocument();
    },
  );

  it.each<UsuarioRole>(['ESTAGIARIO', 'OBSERVADOR'])(
    'nao renderiza para %s',
    (role) => {
      mockUser(role);

      render(
        <CanCreateConvenio>
          <span>criar convenio</span>
        </CanCreateConvenio>,
      );

      expect(screen.queryByText('criar convenio')).not.toBeInTheDocument();
    },
  );
});

describe('CanCreateComunicado', () => {
  it.each<UsuarioRole>(['ADMIN', 'ANALISTA', 'ESTAGIARIO'])(
    'renderiza para %s',
    (role) => {
      mockUser(role);

      render(
        <CanCreateComunicado>
          <span>criar comunicado</span>
        </CanCreateComunicado>,
      );

      expect(screen.getByText('criar comunicado')).toBeInTheDocument();
    },
  );

  it('nao renderiza para OBSERVADOR', () => {
    mockUser('OBSERVADOR');

    render(
      <CanCreateComunicado>
        <span>criar comunicado</span>
      </CanCreateComunicado>,
    );

    expect(screen.queryByText('criar comunicado')).not.toBeInTheDocument();
  });
});

describe('HideForObserver', () => {
  it('esconde para OBSERVADOR', () => {
    mockUser('OBSERVADOR');

    render(
      <HideForObserver>
        <span>acao</span>
      </HideForObserver>,
    );

    expect(screen.queryByText('acao')).not.toBeInTheDocument();
  });

  it.each<UsuarioRole>(['ADMIN', 'ANALISTA', 'ESTAGIARIO'])(
    'exibe para %s',
    (role) => {
      mockUser(role);

      render(
        <HideForObserver>
          <span>acao</span>
        </HideForObserver>,
      );

      expect(screen.getByText('acao')).toBeInTheDocument();
    },
  );
});
