import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { consumeSessionNotice } from "@/modules/auth/lib/authStorage";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { toast } from "@/modules/shared/ui/toaster";

const loginSchema = z.object({
  matricula: z.string().min(1, "Informe sua matrícula"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const message = consumeSessionNotice();
    if (message) {
      toast.error(message);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMessage(null);
      await login(data);
      const redirect = (location.state as { from?: Location })?.from?.pathname;
      navigate(redirect ?? "/dashboard", { replace: true });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        "Não foi possível autenticar. Verifique sua matrícula e senha.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 p-12 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-200/20 blur-2xl" />
        </div>

        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <img
            src="/assets/brasao.png"
            alt="Brasão de Votorantim"
            className="mb-8 h-36 w-auto drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold leading-tight text-slate-800">
            Prefeitura de Votorantim
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-500">
            Secretaria de Planejamento e Desenvolvimento
          </p>
          <div className="mt-8 rounded-2xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-700">
              Sistema de Gestão de Convênios
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Plataforma interna para controle de convênios, comunicados, agenda
              institucional e acompanhamento financeiro.
            </p>
          </div>
          <p className="mt-8 text-xs text-slate-400">
            VOTORANTIM - SP &bull; {new Date().getFullYear()}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img
              src="/assets/brasao.png"
              alt="Brasão de Votorantim"
              className="mb-4 h-20 w-auto"
            />
            <p className="text-sm font-medium text-slate-400">
              Prefeitura de Votorantim
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              Bem-vindo de volta
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Informe sua matrícula e senha para acessar o sistema.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Matrícula
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  {...register("matricula")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Ex: 12345"
                  autoComplete="username"
                />
              </div>
              {errors.matricula && (
                <p className="mt-1.5 text-xs text-rose-500">
                  {errors.matricula.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("senha")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-xs text-rose-500">
                  {errors.senha.message}
                </p>
              )}
            </div>
            {errorMessage && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/50 transition hover:from-blue-600 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Acesso restrito a servidores municipais.
            <br />
            Caso não possua cadastro, procure o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
