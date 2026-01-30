import { AppRoutes } from "./routes";
import { Toaster } from "@/modules/shared/ui/toaster";

export const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
};

export default App;
