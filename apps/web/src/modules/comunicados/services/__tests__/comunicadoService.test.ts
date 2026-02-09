import { comunicadoService } from "../comunicadoService";

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

const fakeComunicado = {
  id: "com-1",
  titulo: "Aviso importante",
  conteudo: "Conteúdo do comunicado",
};

describe("comunicadoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should call api.get with /comunicados", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [fakeComunicado] });

      const result = await comunicadoService.list();

      expect(mockedApi.get).toHaveBeenCalledWith("/comunicados");
      expect(result).toEqual([fakeComunicado]);
    });

    it("should return an empty array when no comunicados exist", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const result = await comunicadoService.list();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should call api.post with /comunicados and payload", async () => {
      const payload = { titulo: "Novo comunicado", conteudo: "Texto" };
      mockedApi.post.mockResolvedValueOnce({
        data: { id: "com-2", ...payload },
      });

      const result = await comunicadoService.create(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/comunicados", payload);
      expect(result).toEqual({ id: "com-2", ...payload });
    });
  });

  describe("update", () => {
    it("should call api.put with /comunicados/:id and payload", async () => {
      const payload = { titulo: "Titulo atualizado" };
      mockedApi.put.mockResolvedValueOnce({
        data: { ...fakeComunicado, ...payload },
      });

      const result = await comunicadoService.update("com-1", payload);

      expect(mockedApi.put).toHaveBeenCalledWith("/comunicados/com-1", payload);
      expect(result).toEqual({ ...fakeComunicado, ...payload });
    });
  });

  describe("remove", () => {
    it("should call api.delete with /comunicados/:id", async () => {
      mockedApi.delete.mockResolvedValueOnce({});

      await comunicadoService.remove("com-1");

      expect(mockedApi.delete).toHaveBeenCalledWith("/comunicados/com-1");
    });
  });
});
