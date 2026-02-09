import { convenioService, type ConvenioFilters } from "../convenioService";

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

const fakeConvenio = {
  id: "conv-1",
  numero: "001/2026",
  objeto: "Obra de pavimentação",
  status: "EM_EXECUCAO",
};

describe("convenioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should call api.get with /convenios and no params when no filters", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [fakeConvenio] });

      const result = await convenioService.list();

      expect(mockedApi.get).toHaveBeenCalledWith("/convenios", { params: {} });
      expect(result).toEqual([fakeConvenio]);
    });

    it("should pass only truthy filters as params", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const filters: ConvenioFilters = {
        search: "pavimentação",
        status: "EM_EXECUCAO",
        secretariaId: "",
        esfera: "",
      };

      await convenioService.list(filters);

      expect(mockedApi.get).toHaveBeenCalledWith("/convenios", {
        params: {
          search: "pavimentação",
          status: "EM_EXECUCAO",
        },
      });
    });

    it("should pass all provided filters as params", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const filters: ConvenioFilters = {
        search: "test",
        status: "EM_EXECUCAO",
        secretariaId: "sec-1",
        esfera: "FEDERAL",
        modalidadeRepasse: "FUNDO_A_FUNDO",
        dataInicioVigencia: "2026-01-01",
        dataFimVigencia: "2026-12-31",
        valorMin: "1000",
        valorMax: "50000",
      };

      await convenioService.list(filters);

      expect(mockedApi.get).toHaveBeenCalledWith("/convenios", {
        params: {
          search: "test",
          status: "EM_EXECUCAO",
          secretariaId: "sec-1",
          esfera: "FEDERAL",
          modalidadeRepasse: "FUNDO_A_FUNDO",
          dataInicioVigencia: "2026-01-01",
          dataFimVigencia: "2026-12-31",
          valorMin: "1000",
          valorMax: "50000",
        },
      });
    });
  });

  describe("getById", () => {
    it("should call api.get with /convenios/:id", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeConvenio });

      const result = await convenioService.getById("conv-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/convenios/conv-1");
      expect(result).toEqual(fakeConvenio);
    });
  });

  describe("create", () => {
    it("should call api.post with /convenios and payload", async () => {
      const payload = { numero: "002/2026", objeto: "Nova obra" };
      mockedApi.post.mockResolvedValueOnce({ data: { id: "conv-2", ...payload } });

      const result = await convenioService.create(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/convenios", payload);
      expect(result).toEqual({ id: "conv-2", ...payload });
    });
  });

  describe("update", () => {
    it("should call api.put with /convenios/:id and payload", async () => {
      const payload = { objeto: "Obra atualizada" };
      mockedApi.put.mockResolvedValueOnce({
        data: { ...fakeConvenio, ...payload },
      });

      const result = await convenioService.update("conv-1", payload);

      expect(mockedApi.put).toHaveBeenCalledWith("/convenios/conv-1", payload);
      expect(result).toEqual({ ...fakeConvenio, ...payload });
    });
  });

  describe("remove", () => {
    it("should call api.delete with /convenios/:id", async () => {
      mockedApi.delete.mockResolvedValueOnce({});

      await convenioService.remove("conv-1");

      expect(mockedApi.delete).toHaveBeenCalledWith("/convenios/conv-1");
    });
  });

  describe("getValoresVigentes", () => {
    it("should call api.get with /convenios/:id/valores-vigentes", async () => {
      const valores = {
        repasse: 100000,
        contrapartida: 20000,
        total: 120000,
      };
      mockedApi.get.mockResolvedValueOnce({ data: valores });

      const result = await convenioService.getValoresVigentes("conv-1");

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/convenios/conv-1/valores-vigentes"
      );
      expect(result).toEqual(valores);
    });
  });
});
