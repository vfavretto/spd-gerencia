import {
  CalendarDays,
  FileText,
  Home,
  Layers,
  Megaphone,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Convênios', to: '/convenios', icon: FileText },
  { label: 'Calendário', to: '/calendario', icon: CalendarDays },
  { label: 'Comunicados', to: '/comunicados', icon: Megaphone },
  { label: 'Configurações', to: '/configuracoes', icon: Settings }
];

export const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-white/40 bg-gradient-to-b from-primary-600 via-primary-700 to-primary-900 px-6 py-8 text-white shadow-2xl md:flex">
      <div className="flex items-center gap-3 pb-10">
        <div className="rounded-2xl bg-white/10 p-2 text-white">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-white/70">SPD</p>
          <strong className="text-lg">Gestor Interno</strong>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all',
                  isActive
                    ? 'bg-white text-primary-700 shadow-lg'
                    : 'text-white/80 hover:bg-white/10'
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="rounded-3xl bg-white/10 p-4 text-sm text-white/80">
        <p className="font-semibold text-white">Secretaria de Planejamento</p>
        <p>Prefeitura de Votorantim</p>
      </div>
    </aside>
  );
};
