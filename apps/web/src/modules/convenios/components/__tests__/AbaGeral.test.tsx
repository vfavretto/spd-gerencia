import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { AbaGeral } from "../AbaGeral";
import type { Convenio } from "@/modules/shared/types";

vi.mock("@/modules/configuracoes/services/configService", () => ({
  configService: {
    getCatalogs: vi.fn().mockResolvedValue({
      secretarias: [],
      orgaos: [],
      programas: [],
      modalidadesRepasse: []
    })
  }
}));

const emendaModalMock = vi.fn(() => null);

vi.mock("../modals/RegistrarAssinaturaModal", () => ({
  RegistrarAssinaturaModal: () => null
}));

vi.mock("../modals/AditivarModal", () => ({
  AditivarModal: () => null
}));

vi.mock("../modals/EmendaModal", () => ({
  EmendaModal: (props: unknown) => {
    emendaModalMock(props);
    return null;
  }
}));

function makeConvenio(): Convenio {
  return {
    id: "conv-1",
    codigo: "CV-001",
    titulo: "Convênio Teste",
    objeto: "Objeto de teste",
    status: "RASCUNHO",
    valorGlobal: 100000,
    secretaria: { id: "sec-1", nome: "Secretaria de Teste" },
    emendas: [
      {
        id: "em-1",
        nomeParlamentar: "João Silva",
        partido: "MDB",
        codigoEmenda: "EMD-001",
        funcao: "Saúde",
        subfuncao: "Atenção Básica",
        programa: "Programa A",
        valorIndicado: 50000,
        anoEmenda: 2025,
        convenioId: "conv-1"
      },
      {
        id: "em-2",
        nomeParlamentar: "Maria Souza",
        partido: "PT",
        codigoEmenda: "EMD-002",
        funcao: "Educação",
        subfuncao: "Ensino Fundamental",
        programa: "Programa B",
        valorIndicado: 30000,
        anoEmenda: 2026,
        convenioId: "conv-1"
      }
    ]
  };
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AbaGeral convenio={makeConvenio()} onUpdate={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("AbaGeral - Emendas Parlamentares", () => {
  it("expande apenas uma emenda por vez e inicia recolhido", async () => {
    renderComponent();

    expect(screen.queryByText("Atenção Básica")).not.toBeInTheDocument();
    expect(screen.queryByText("Ensino Fundamental")).not.toBeInTheDocument();

    const emendaJoao = screen.getByRole("button", { name: /expandir emenda de joão silva/i });
    const emendaMaria = screen.getByRole("button", { name: /expandir emenda de maria souza/i });

    fireEvent.click(emendaJoao);
    expect(screen.getByText("Atenção Básica")).toBeInTheDocument();
    expect(screen.queryByText("Ensino Fundamental")).not.toBeInTheDocument();

    fireEvent.click(emendaMaria);
    expect(screen.queryByText("Atenção Básica")).not.toBeInTheDocument();
    expect(screen.getByText("Ensino Fundamental")).toBeInTheDocument();

    fireEvent.click(emendaMaria);
    expect(screen.queryByText("Ensino Fundamental")).not.toBeInTheDocument();
  });

  it("nao alterna expansao ao clicar em editar", () => {
    renderComponent();

    const emendaJoao = screen.getByRole("button", { name: /expandir emenda de joão silva/i });
    const editarBotoes = screen.getAllByTitle("Editar emenda");

    expect(emendaJoao).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(editarBotoes[0]);
    expect(emendaJoao).toHaveAttribute("aria-expanded", "false");
  });
});
