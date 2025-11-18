import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-100 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Secretaria de Planejamento e Desenvolvimento
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Painel interno de convênios
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-primary-200 hover:text-primary-600">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {user?.nome ?? 'Usuário'}
            </p>
            <span className="text-xs text-slate-500">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
