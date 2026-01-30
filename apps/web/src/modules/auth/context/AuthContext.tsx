import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { authService } from "@/modules/auth/services/authService";
import type { User } from "@/modules/shared/types";
import { setAuthToken } from "@/modules/shared/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (credentials: { email: string; senha: string }) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "@spd/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = {
  user: User | null;
  token: string | null;
};

const defaultState: AuthState = {
  user: null,
  token: null
};

// Função de inicialização síncrona para evitar setState em useEffect
const getInitialState = (): AuthState => {
  if (typeof window === "undefined") return defaultState;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: AuthState = JSON.parse(stored);
      setAuthToken(parsed.token);
      return parsed;
    } catch {
      return defaultState;
    }
  }
  return defaultState;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>(getInitialState);
  // Inicialização é síncrona agora, então começa como false
  const [initializing] = useState(false);

  const login = useCallback(async ({ email, senha }: { email: string; senha: string }) => {
    const response = await authService.login(email, senha);
    const nextState: AuthState = {
      user: response.usuario,
      token: response.token
    };
    setState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthToken(response.token);
  }, []);

  const logout = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      isAuthenticated: Boolean(state.token && state.user),
      initializing,
      login,
      logout
    }),
    [state, initializing, login, logout]
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
