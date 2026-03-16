import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ComunicadosPage } from "../ComunicadosPage";

const { listMock, createMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  createMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("@/modules/comunicados/services/comunicadoService", () => ({
  comunicadoService: {
    list: listMock,
    create: createMock,
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock("@/modules/auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      nome: "Administrador Teste",
      email: "admin@example.com",
      role: "ADMIN",
    },
    token: "token",
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const comunicadosFixture = [
  {
    id: "com-1",
    protocolo: "COM-001/2026",
    assunto: "Solicitacao de documentos",
    conteudo: "Encaminhar documentacao complementar ao convenio.",
    tipo: "ENTRADA" as const,
    dataRegistro: "2026-03-15T12:00:00.000Z",
    origem: "Secretaria de Obras",
    destino: "Gerencia de Convenios",
    responsavel: "Maria Souza",
    arquivoUrl: "https://example.com/doc-1.pdf",
  },
  {
    id: "com-2",
    protocolo: "COM-002/2026",
    assunto: "Resposta ao orgao concedente",
    conteudo: null,
    tipo: "SAIDA" as const,
    dataRegistro: "2026-03-10T12:00:00.000Z",
    origem: "Gerencia de Convenios",
    destino: "Orgao Concedente",
    responsavel: "Joao Lima",
    arquivoUrl: null,
  },
];

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderPage = () => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ComunicadosPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ComunicadosPage", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(() => {
    listMock.mockReset();
    createMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    listMock.mockResolvedValue(comunicadosFixture);
    createMock.mockResolvedValue(comunicadosFixture[0]);
  });

  it("renderiza metricas e cards do historico", async () => {
    renderPage();

    expect(await screen.findByText("Comunicados cadastrados")).toBeInTheDocument();
    expect(await screen.findByText("Com anexo")).toBeInTheDocument();
    expect(screen.getByText("Registros visíveis")).toBeInTheDocument();
    expect(screen.getByText("Entradas")).toBeInTheDocument();
    expect(screen.getByText("Saídas")).toBeInTheDocument();
    expect(screen.getByText("Responsáveis")).toBeInTheDocument();
    expect(screen.getByText("itens no contexto atual")).toBeInTheDocument();
    expect(screen.getByText("filtros aplicados")).toBeInTheDocument();
    expect(screen.getAllByText("Abrir painel")).toHaveLength(2);
  });

  it("aplica busca e limpa filtros", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = await screen.findByLabelText("Buscar");
    await user.type(searchInput, "Resposta");

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "Resposta" }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Limpar" }));

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({});
    });
    expect(screen.getByLabelText("Buscar")).toHaveValue("");
  });

  it("abre o drawer com detalhes do comunicado selecionado", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /resposta ao orgao concedente/i }),
    );

    expect(
      await screen.findByText("Sem conteudo complementar informado para este comunicado."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nenhum link de arquivo foi informado para este comunicado."),
    ).toBeInTheDocument();
  });

  it("envia cadastro no modal e limpa campo oculto ao alternar tipo", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /registrar comunicado/i }),
    );

    await user.type(screen.getByLabelText("Protocolo"), "COM-003/2026");
    await user.type(screen.getByLabelText("Assunto"), "Novo comunicado");
    await user.type(screen.getByLabelText("Destinatario"), "Setor interno");
    await user.click(screen.getByLabelText("Saída"));
    await user.type(screen.getByLabelText("Origem"), "Secretaria de Educacao");
    await user.click(screen.getByRole("button", { name: /^registrar comunicado$/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          protocolo: "COM-003/2026",
          assunto: "Novo comunicado",
          tipo: "SAIDA",
          origem: "Secretaria de Educacao",
          destino: undefined,
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Cadastre o protocolo com os campos ja usados pelo sistema/i),
      ).not.toBeInTheDocument();
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("Comunicado registrado com sucesso.");
  });
});
