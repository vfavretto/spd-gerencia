import { authService } from "../authService";

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

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call api.post with /auth/login and credentials", async () => {
      const loginResponse = {
        token: "fake-token",
        user: { id: "1", nome: "Test", matricula: "12345", role: "ADMIN" },
      };
      mockedApi.post.mockResolvedValueOnce({ data: loginResponse });

      const result = await authService.login("12345", "senha123");

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
        matricula: "12345",
        senha: "senha123",
      });
      expect(result).toEqual(loginResponse);
    });

    it("should propagate errors from api.post", async () => {
      mockedApi.post.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(authService.login("wrong", "wrong")).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("register", () => {
    it("should call api.post with /auth/register and payload", async () => {
      const payload = {
        nome: "Novo Usuario",
        matricula: "99999",
        senha: "pass",
        role: "VIEWER" as const,
      };
      const created = { id: "2", nome: "Novo Usuario", matricula: "99999", role: "VIEWER" };
      mockedApi.post.mockResolvedValueOnce({ data: created });

      const result = await authService.register(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", payload);
      expect(result).toEqual(created);
    });
  });

  describe("listUsers", () => {
    it("should call api.get with /auth/users", async () => {
      const users = [
        { id: "1", nome: "User 1", matricula: "111", role: "ADMIN" },
        { id: "2", nome: "User 2", matricula: "222", role: "VIEWER" },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: users });

      const result = await authService.listUsers();

      expect(mockedApi.get).toHaveBeenCalledWith("/auth/users");
      expect(result).toEqual(users);
    });
  });
});
