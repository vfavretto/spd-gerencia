import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';
import { setAuthToken } from '../lib/api';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (credentials: { email: string; senha: string }) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = '@spd/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = {
  user: User | null;
  token: string | null;
};

const defaultState: AuthState = {
  user: null,
  token: null
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>(defaultState);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: AuthState = JSON.parse(stored);
      setState(parsed);
      setAuthToken(parsed.token);
    }
    setInitializing(false);
  }, []);

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
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
