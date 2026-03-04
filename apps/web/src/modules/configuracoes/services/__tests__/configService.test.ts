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
const fakeModalidadesRepasse = [{ id: "mod-1", nome: "Convênio" }];

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

  describe("listModalidadesRepasse", () => {
    it("should call api.get with /configuracoes/modalidades-repasse", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: fakeModalidadesRepasse });

      const result = await configService.listModalidadesRepasse();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/modalidades-repasse");
      expect(result).toEqual(fakeModalidadesRepasse);
    });
  });

  describe("getCatalogs", () => {
    it("should call all catalog endpoints and return combined catalogs", async () => {
      mockedApi.get
        .mockResolvedValueOnce({ data: fakeSecretarias })
        .mockResolvedValueOnce({ data: fakeOrgaos })
        .mockResolvedValueOnce({ data: fakeProgramas })
        .mockResolvedValueOnce({ data: fakeModalidadesRepasse });

      const result = await configService.getCatalogs();

      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/secretarias");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/orgaos");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/programas");
      expect(mockedApi.get).toHaveBeenCalledWith("/configuracoes/modalidades-repasse");
      expect(mockedApi.get).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        secretarias: fakeSecretarias,
        orgaos: fakeOrgaos,
        programas: fakeProgramas,
        modalidadesRepasse: fakeModalidadesRepasse,
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

      await configService.create("modalidadesRepasse", { nome: "Z" });
      expect(mockedApi.post).toHaveBeenCalledWith("/configuracoes/modalidades-repasse", { nome: "Z" });
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
