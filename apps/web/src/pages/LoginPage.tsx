import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  senha: z.string().min(6, 'Minímo de 6 caracteres')
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMessage(null);
      await login(data);
      const redirect = (location.state as { from?: Location })?.from?.pathname;
      navigate(redirect ?? '/dashboard', { replace: true });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível autenticar. Confira os dados.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-indigo-600 px-4 py-10">
      <div className="glass-panel w-full max-w-4xl overflow-hidden border-none bg-white/90 p-0 shadow-2xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative hidden min-h-full flex-col justify-between bg-gradient-to-b from-primary-600/80 to-primary-900/90 p-10 text-white md:flex">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                Prefeitura de Votorantim
              </p>
              <h2 className="mt-6 text-3xl font-semibold leading-tight">
                Secretaria de Planejamento e Desenvolvimento
              </h2>
              <p className="mt-3 text-sm text-white/80">
                Sistema interno para controle de convênios, comunicados e agenda
                institucional.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 text-sm text-white/80 backdrop-blur">
              <p>Use suas credenciais corporativas para acessar o painel.</p>
            </div>
          </div>

          <div className="p-10">
            <h1 className="text-2xl font-semibold text-slate-900">
              Acesso ao painel
            </h1>
            <p className="text-sm text-slate-500">
              Informe seu e-mail institucional e senha cadastrada.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  {...register('email')}
                  className="form-input"
                  placeholder="ex: nome.sobrenome@votorantim.sp.gov.br"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  {...register('senha')}
                  className="form-input"
                  placeholder="********"
                />
                {errors.senha && (
                  <p className="mt-1 text-xs text-rose-500">
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
                className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
