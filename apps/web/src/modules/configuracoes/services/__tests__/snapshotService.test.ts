import { snapshotService } from "../snapshotService";

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

describe("snapshotService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listByConvenio", () => {
    it("should call api.get with /convenios/:id/snapshots", async () => {
      const snapshots = [
        { id: "snap-1", convenioId: "conv-1", versao: 1, createdAt: "2026-01-01" },
        { id: "snap-2", convenioId: "conv-1", versao: 2, createdAt: "2026-01-15" },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: snapshots });

      const result = await snapshotService.listByConvenio("conv-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/convenios/conv-1/snapshots");
      expect(result).toEqual(snapshots);
    });

    it("should return empty array when no snapshots exist", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const result = await snapshotService.listByConvenio("conv-999");

      expect(result).toEqual([]);
    });
  });

  describe("compare", () => {
    it("should call api.get with correct URL and version params", async () => {
      const compareResult = {
        versao1: 1,
        versao2: 2,
        diferencas: [
          { campo: "objeto", valorAnterior: "Obra A", valorNovo: "Obra B" },
        ],
      };
      mockedApi.get.mockResolvedValueOnce({ data: compareResult });

      const result = await snapshotService.compare("conv-1", 1, 2);

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/convenios/conv-1/snapshots/compare",
        { params: { versao1: 1, versao2: 2 } }
      );
      expect(result).toEqual(compareResult);
    });

    it("should propagate API errors", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Not Found"));

      await expect(
        snapshotService.compare("conv-999", 1, 2)
      ).rejects.toThrow("Not Found");
    });
  });
});
