import { AppRoutes } from './routes';
import { Toaster } from '@/components/ui/toaster';

export const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
};

export default App;
