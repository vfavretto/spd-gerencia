import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmendaModal } from "../EmendaModal";
import { emendaService } from "@/modules/convenios/services/emendaService";

vi.mock("@/modules/convenios/services/emendaService", () => ({
  emendaService: {
    create: vi.fn(),
    update: vi.fn(),
    listByConvenio: vi.fn(),
    getById: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("@/modules/shared/ui/toaster", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EmendaModal
        isOpen
        onClose={vi.fn()}
        convenioId="conv-1"
        onSuccess={vi.fn()}
      />
    </QueryClientProvider>
  );
}

describe("EmendaModal", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("nao renderiza campos redundantes de programa e valor indicado", () => {
    renderComponent();

    expect(screen.queryByLabelText(/programa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/valor indicado/i)).not.toBeInTheDocument();
  });

  it("envia payload sem programa e valorIndicado no cadastro", async () => {
    vi.mocked(emendaService.create).mockResolvedValue({
      id: "em-1"
    } as never);

    renderComponent();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nome do parlamentar/i), "Carlos Lima");
    await user.click(screen.getByRole("button", { name: /cadastrar emenda/i }));

    await waitFor(() => {
      expect(emendaService.create).toHaveBeenCalledTimes(1);
    });

    const payload = vi.mocked(emendaService.create).mock.calls[0][1] as Record<string, unknown>;

    expect(payload).not.toHaveProperty("programa");
    expect(payload).not.toHaveProperty("valorIndicado");
  });
});
