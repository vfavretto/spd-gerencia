import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/modules/auth/context/AuthContext";

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col gap-4 bg-transparent px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
          Visão Geral
        </p>
        <h1 className="text-2xl font-bold text-slate-800">
          Bem-vindo, {user?.nome?.split(" ")[0] ?? "Usuário"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-2xl bg-white p-3 text-slate-400 shadow-sm transition hover:text-primary-600 hover:shadow-md">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 rounded-3xl bg-white pl-4 pr-2 py-1.5 shadow-sm">
           <div className="text-right">
             <p className="text-sm font-bold text-slate-800 leading-tight">
               {user?.nome ?? "Admin Votorantim"}
             </p>
             <p className="text-[10px] font-semibold text-slate-400 uppercase">
               {user?.role ?? "Gestor"}
             </p>
           </div>
           <div className="h-10 w-10 rounded-full bg-primary-100 p-0.5">
             <img 
               src={`https://ui-avatars.com/api/?name=${user?.nome ?? "A"}&background=random`} 
               alt="Avatar" 
               className="h-full w-full rounded-full object-cover"
             />
           </div>
           
           <button
            onClick={logout}
            className="ml-2 rounded-full bg-slate-50 p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
