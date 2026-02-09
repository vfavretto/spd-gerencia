import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Megaphone,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
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
        "relative hidden min-h-screen flex-col border-r border-slate-100 bg-white py-8 shadow-sm transition-all duration-300 md:flex",
        isCollapsed ? "w-20 px-3" : "w-72 px-6"
      ].join(" ")}
    >
      {/* Botão de toggle - posicionado relativo ao aside */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-primary-600 hover:shadow-md"
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo / Branding */}
      <div className="flex flex-col items-center justify-center gap-4 pb-10 text-center">
        <div className="relative">
          <img
            src="/assets/brasao.png"
            alt="Brasão Votorantim"
            className={`object-contain transition-all duration-300 ${isCollapsed ? "h-10 w-auto" : "h-20 w-auto"}`}
          />
        </div>

        {!isCollapsed && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-xl font-bold leading-tight text-slate-800">
              Gestão de Convênios
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
              VOTORANTIM - SP
            </p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
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
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                ].join(" ")
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
