import { auditoriaService, type AuditoriaFilters } from "../auditoriaService";

vi.mock("@/modules/shared/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/modules/shared/lib/api";

const mockedApi = vi.mocked(api);

describe("auditoriaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should call api.get with /auditoria and no params when no filters", async () => {
      const response = { data: [], total: 0, page: 1, totalPages: 0 };
      mockedApi.get.mockResolvedValueOnce({ data: response });

      const result = await auditoriaService.list();

      expect(mockedApi.get).toHaveBeenCalledWith("/auditoria", { params: {} });
      expect(result).toEqual(response);
    });

    it("should pass only truthy filters as params", async () => {
      const response = { data: [], total: 0, page: 1, totalPages: 0 };
      mockedApi.get.mockResolvedValueOnce({ data: response });

      const filters: AuditoriaFilters = {
        acao: "CREATE",
        entidade: "",
        dataInicio: "",
        dataFim: "",
      };

      await auditoriaService.list(filters);

      expect(mockedApi.get).toHaveBeenCalledWith("/auditoria", {
        params: { acao: "CREATE" },
      });
    });

    it("should pass all provided filters including pagination", async () => {
      const response = { data: [], total: 5, page: 2, totalPages: 3 };
      mockedApi.get.mockResolvedValueOnce({ data: response });

      const filters: AuditoriaFilters = {
        acao: "UPDATE",
        entidade: "Convenio",
        dataInicio: "2026-01-01",
        dataFim: "2026-01-31",
        page: 2,
        limit: 10,
      };

      const result = await auditoriaService.list(filters);

      expect(mockedApi.get).toHaveBeenCalledWith("/auditoria", {
        params: {
          acao: "UPDATE",
          entidade: "Convenio",
          dataInicio: "2026-01-01",
          dataFim: "2026-01-31",
          page: 2,
          limit: 10,
        },
      });
      expect(result).toEqual(response);
    });

    it("should propagate API errors", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(auditoriaService.list()).rejects.toThrow("Network Error");
    });
  });
});
