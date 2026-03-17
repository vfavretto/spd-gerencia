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
        usuario: {
          id: "1",
          nome: "Test",
          email: "test@example.com",
          matricula: "12345",
          role: "ADMIN",
        },
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
        email: "novo@example.com",
        matricula: "99999",
        senha: "pass123",
        role: "OBSERVADOR" as const,
      };
      const created = {
        id: "2",
        nome: "Novo Usuario",
        email: "novo@example.com",
        matricula: "99999",
        role: "OBSERVADOR",
        ativo: true,
        criadoEm: "2026-03-17T00:00:00.000Z",
      };
      mockedApi.post.mockResolvedValueOnce({ data: created });

      const result = await authService.register(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", payload);
      expect(result).toEqual(created);
    });
  });

  describe("listUsers", () => {
    it("should call api.get with /auth/users", async () => {
      const users = [
        {
          id: "1",
          nome: "User 1",
          email: "user1@example.com",
          matricula: "111",
          role: "ADMIN",
          ativo: true,
          criadoEm: "2026-03-17T00:00:00.000Z",
        },
        {
          id: "2",
          nome: "User 2",
          email: "user2@example.com",
          matricula: "222",
          role: "OBSERVADOR",
          ativo: false,
          criadoEm: "2026-03-17T00:00:00.000Z",
        },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: users });

      const result = await authService.listUsers();

      expect(mockedApi.get).toHaveBeenCalledWith("/auth/users");
      expect(result).toEqual(users);
    });
  });

  describe("updateUser", () => {
    it("should call api.put with /auth/users/:id and payload", async () => {
      const updated = {
        id: "1",
        nome: "User 1",
        email: "user1@example.com",
        matricula: "111",
        role: "ADMIN",
        ativo: true,
        criadoEm: "2026-03-17T00:00:00.000Z",
      };
      mockedApi.put.mockResolvedValueOnce({ data: updated });

      const result = await authService.updateUser("1", { role: "ADMIN" });

      expect(mockedApi.put).toHaveBeenCalledWith("/auth/users/1", { role: "ADMIN" });
      expect(result).toEqual(updated);
    });
  });

  describe("deactivateUser", () => {
    it("should call api.delete with /auth/users/:id", async () => {
      mockedApi.delete.mockResolvedValueOnce({});

      await authService.deactivateUser("1");

      expect(mockedApi.delete).toHaveBeenCalledWith("/auth/users/1");
    });
  });
});
