import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
