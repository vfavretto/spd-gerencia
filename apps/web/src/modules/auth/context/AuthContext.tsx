import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { authService } from "@/modules/auth/services/authService";
import {
  clearAuthSession,
  defaultAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/modules/auth/lib/authStorage";
import type { User } from "@/modules/shared/types";
import { setAuthToken } from "@/modules/shared/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (credentials: { matricula: string; senha: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = {
  user: User | null;
  token: string | null;
};

const defaultState: AuthState = defaultAuthSession;

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") return defaultState;
  const parsed = readAuthSession();
  setAuthToken(parsed.token);
  return parsed;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(getInitialState);
  const [initializing] = useState(false);

  const login = useCallback(
    async ({ matricula, senha }: { matricula: string; senha: string }) => {
      const response = await authService.login(matricula, senha);
      const nextState: AuthState = {
        user: response.usuario,
        token: response.token,
      };
      setState(nextState);
      writeAuthSession(nextState);
      setAuthToken(response.token);
    },
    [],
  );

  const logout = useCallback(() => {
    setState(defaultState);
    clearAuthSession();
    setAuthToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      isAuthenticated: Boolean(state.token && state.user),
      initializing,
      login,
      logout,
    }),
    [state, initializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }
  return context;
};
