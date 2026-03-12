import type { User } from "@/modules/shared/types";

const AUTH_STORAGE_KEY = "@spd/auth";
const SESSION_NOTICE_KEY = "@spd/auth-notice";

export type AuthSession = {
  user: User | null;
  token: string | null;
};

export const defaultAuthSession: AuthSession = {
  user: null,
  token: null
};

export const readAuthSession = (): AuthSession => {
  if (typeof window === "undefined") return defaultAuthSession;

  const stored = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return defaultAuthSession;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return defaultAuthSession;
  }
};

export const writeAuthSession = (session: AuthSession) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const writeSessionNotice = (message: string) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_NOTICE_KEY, message);
};

export const consumeSessionNotice = () => {
  if (typeof window === "undefined") return null;

  const message = window.sessionStorage.getItem(SESSION_NOTICE_KEY);
  if (!message) return null;

  window.sessionStorage.removeItem(SESSION_NOTICE_KEY);
  return message;
};
