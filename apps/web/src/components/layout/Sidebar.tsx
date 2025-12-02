import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Layers,
  Megaphone,
  Settings
} from 'lucide-react';
// useState removido - não utilizado
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Convênios', to: '/convenios', icon: FileText },
  { label: 'Calendário', to: '/calendario', icon: CalendarDays },
  { label: 'Comunicados', to: '/comunicados', icon: Megaphone },
  { label: 'Configurações', to: '/configuracoes', icon: Settings }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={[
        'hidden min-h-screen flex-col border-r border-white/40 bg-gradient-to-b from-primary-600 via-primary-700 to-primary-900 py-8 text-white shadow-2xl transition-all duration-300 md:flex',
        isCollapsed ? 'w-20 px-3' : 'w-72 px-6'
      ].join(' ')}
    >
      <div className="flex items-center justify-between pb-10">
        <div className={['flex items-center gap-3', isCollapsed && 'justify-center'].join(' ')}>
          <div className="rounded-2xl bg-white/10 p-2 text-white">
            <Layers className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">SPD</p>
              <strong className="text-lg">Gestor Interno</strong>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="rounded-xl bg-white/10 p-2 text-white transition-all hover:bg-white/20"
            title="Colapsar sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-4 rounded-xl bg-white/10 p-2 text-white transition-all hover:bg-white/20"
          title="Expandir sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-2xl font-medium transition-all',
                  isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-white text-primary-700 shadow-lg'
                    : 'text-white/80 hover:bg-white/10'
                ].join(' ')
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && item.label}
            </NavLink>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="rounded-3xl bg-white/10 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">Secretaria de Planejamento</p>
          <p>Prefeitura de Votorantim</p>
        </div>
      )}
    </aside>
  );
};
