import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Megaphone,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Beneficiários', to: '/beneficiarios', icon: FileText }, // Exemplo da imagem, mas vou manter Convênios se for o caso
  { label: 'Convênios', to: '/convenios', icon: FileText },
  { label: "Faturamento", to: "/faturamento", icon: FileText }, // Placeholder
  { label: "Relatórios", to: "/relatorios", icon: FileText }, // Placeholder
  { label: "Calendário", to: "/calendario", icon: CalendarDays },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Configurações", to: "/configuracoes", icon: Settings }
];
// Ajustando para os itens reais do projeto
const realNavItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Convênios", to: "/convenios", icon: FileText },
  { label: "Calendário", to: "/calendario", icon: CalendarDays },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Configurações", to: "/configuracoes", icon: Settings }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={[
        "hidden min-h-screen flex-col border-r border-slate-100 bg-white py-8 transition-all duration-300 md:flex shadow-sm",
        isCollapsed ? "w-20 px-3" : "w-72 px-6"
      ].join(" ")}
    >
      <div className="flex flex-col items-center justify-center pb-10 gap-4 text-center">
        <div className="relative">
             <img src="/assets/brasao.png" alt="Brasão Votorantim" className="h-20 w-auto object-contain" />
        </div>
        
        {!isCollapsed && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Gestão de Convênios</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">VOTORANTIM - SP</p>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="absolute top-8 right-[-12px] rounded-full border border-slate-100 bg-white p-1.5 text-slate-400 shadow-sm transition-all hover:text-primary-600"
            title="Colapsar sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-6 rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-primary-600"
          title="Expandir sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-2">
        {realNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-2xl font-medium transition-all duration-200",
                  isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                ].join(" ")
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={["h-5 w-5 flex-shrink-0", isCollapsed ? "" : ''].join(' ')} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin/User profile section at bottom if needed, matching design */}
    </aside>
  );
};
