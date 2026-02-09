import { configService } from "../configService";

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

const fakeSecretarias = [{ id: "sec-1", nome: "Secretaria A" }];
const fakeOrgaos = [{ id: "org-1", nome: "Orgão A" }];
const fakeProgramas = [{ id: "prog-1", nome: "Programa A" }];
const fakeFontes = [{ id: "font-1", nome: "Fonte A" }];

describe("configService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listSecretarias", () => {
    it("should call api.get with /configuracoes/secretarias", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeSecretarias });

      const result = await configService.listSecretarias();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/secretarias");
      expect(result).toEqual(fakeSecretarias);
    });
  });

  describe("listOrgaos", () => {
    it("should call api.get with /configuracoes/orgaos", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeOrgaos });

      const result = await configService.listOrgaos();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/orgaos");
      expect(result).toEqual(fakeOrgaos);
    });
  });

  describe("listProgramas", () => {
    it("should call api.get with /configuracoes/programas", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeProgramas });

      const result = await configService.listProgramas();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/programas");
      expect(result).toEqual(fakeProgramas);
    });
  });

  describe("listFontes", () => {
    it("should call api.get with /configuracoes/fontes", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeFontes });

      const result = await configService.listFontes();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/fontes");
      expect(result).toEqual(fakeFontes);
    });
  });

  describe("getCatalogs", () => {
    it("should call all four list endpoints and return combined catalogs", async () => {
      mockedApi.get
        .mockResolvedValueOnce({ data: fakeSecretarias })
        .mockResolvedValueOnce({ data: fakeOrgaos })
        .mockResolvedValueOnce({ data: fakeProgramas })
        .mockResolvedValueOnce({ data: fakeFontes });

      const result = await configService.getCatalogs();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/secretarias");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/orgaos");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/programas");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/fontes");
      expect(mockedApi.get).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        secretarias: fakeSecretarias,
        orgaos: fakeOrgaos,
        programas: fakeProgramas,
        fontes: fakeFontes,
      });
    });
  });

  describe("create", () => {
    it("should call api.post with the correct resource endpoint", async () => {
      const payload = { nome: "Nova Secretaria" };
      mockedApi.post.mockResolvedValueOnce({
        data: { id: "sec-2", ...payload },
      });

      const result = await configService.create("secretarias", payload);

      expect(mockedApi.post).toHaveBeenCalledWith(
        "/configuracoes/secretarias",
        payload
      );
      expect(result).toEqual({ id: "sec-2", ...payload });
    });

    it("should use the correct endpoint for each resource type", async () => {
      mockedApi.post.mockResolvedValue({ data: {} });

      await configService.create("orgaos", { nome: "X" });
      expect(mockedApi.post).toHaveBeenCalledWith("/configuracoes/orgaos", { nome: "X" });

      await configService.create("programas", { nome: "Y" });
      expect(mockedApi.post).toHaveBeenCalledWith("/configuracoes/programas", { nome: "Y" });

      await configService.create("fontes", { nome: "Z" });
      expect(mockedApi.post).toHaveBeenCalledWith("/configuracoes/fontes", { nome: "Z" });
    });
  });

  describe("update", () => {
    it("should call api.put with /configuracoes/:resource/:id", async () => {
      const payload = { nome: "Secretaria Atualizada" };
      mockedApi.put.mockResolvedValueOnce({
        data: { id: "sec-1", ...payload },
      });

      const result = await configService.update("secretarias", "sec-1", payload);

      expect(mockedApi.put).toHaveBeenCalledWith(
        "/configuracoes/secretarias/sec-1",
        payload
      );
      expect(result).toEqual({ id: "sec-1", ...payload });
    });
  });

  describe("remove", () => {
    it("should call api.delete with /configuracoes/:resource/:id", async () => {
      mockedApi.delete.mockResolvedValueOnce({});

      await configService.remove("programas", "prog-1");

      expect(mockedApi.delete).toHaveBeenCalledWith(
        "/configuracoes/programas/prog-1"
      );
    });
  });
});
