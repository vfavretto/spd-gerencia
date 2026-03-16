import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, UserPlus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authService } from "@/modules/auth/services/authService";
import { roleBadgeColors, roleLabels } from "@/modules/configuracoes/config";

const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "ANALISTA", "ESTAGIARIO", "OBSERVADOR"])
});

type RegisterForm = z.infer<typeof registerSchema>;

export function UsersSection() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => authService.listUsers()
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "ANALISTA" }
  });

  const createMutation = useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset({ role: "ANALISTA" } as RegisterForm);
    }
  });

  const users = usersQuery.data ?? [];

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Usuários do sistema</h3>
          <p className="text-sm text-slate-500">
            Cadastre e gerencie os servidores com acesso ao sistema.
          </p>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Nome completo</label>
            <input className="form-input" {...register("nome")} placeholder="Nome do servidor" />
            {errors.nome && <p className="mt-1 text-xs text-rose-500">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              {...register("email")}
              placeholder="email@votorantim.sp.gov.br"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label">Matrícula</label>
            <input className="form-input" {...register("matricula")} placeholder="Ex: 12345" />
            {errors.matricula && (
              <p className="mt-1 text-xs text-rose-500">{errors.matricula.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">Senha inicial</label>
            <input
              type="password"
              className="form-input"
              {...register("senha")}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.senha && <p className="mt-1 text-xs text-rose-500">{errors.senha.message}</p>}
          </div>
          <div>
            <label className="form-label">Permissão</label>
            <select className="form-input" {...register("role")}>
              <option value="ANALISTA">Analista</option>
              <option value="ESTAGIARIO">Estagiário</option>
              <option value="OBSERVADOR">Observador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
          >
            <UserPlus className="h-4 w-4" />
            {createMutation.isPending ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </div>
        {createMutation.isSuccess && (
          <p className="text-sm text-emerald-600">Usuário cadastrado com sucesso.</p>
        )}
        {createMutation.isError && (
          <p className="text-sm text-rose-600">
            Erro ao cadastrar:{" "}
            {(
              createMutation.error as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message ?? "Verifique os dados."}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Matrícula</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Permissão</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{user.nome}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{user.matricula}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeColors[user.role]}`}
                  >
                    <Shield className="h-3 w-3" />
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${user.ativo ? "bg-emerald-400" : "bg-slate-300"}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Nenhum usuário cadastrado.</p>
        )}
      </div>
    </section>
  );
}
