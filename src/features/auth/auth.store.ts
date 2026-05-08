import { create } from 'zustand';
import { authService } from '@/features/auth/auth.service';
import type { AuthTokens, AuthUser, LoginRequest, RegisterRequest } from '@/features/auth/auth.types';

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY ?? 'worldbuild:access-token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY ?? 'worldbuild:refresh-token';
const AUTH_USER_KEY = 'worldbuild:auth-user';

const readStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
};

const readStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(AUTH_USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    return null;
  }
};

const persistSession = (tokens: AuthTokens, user?: AuthUser) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

const clearSession = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  register: (input: RegisterRequest) => Promise<AuthUser>;
  login: (input: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  fetchMe: () => Promise<AuthUser | null>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readStoredUser(),
  accessToken: readStorage(ACCESS_TOKEN_KEY),
  refreshToken: readStorage(REFRESH_TOKEN_KEY),
  isLoading: false,
  error: null,

  register: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.register(input);
      set({ isLoading: false });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const tokens = await authService.login(input);
      persistSession(tokens);
      const user = await authService.me(tokens.access_token);
      persistSession(tokens, user);
      set({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isLoading: false,
      });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      clearSession();
      set({ user: null, accessToken: null, refreshToken: null, error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    set({ isLoading: true, error: null });

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      clearSession();
      set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
    }
  },

  refresh: async () => {
    const refreshToken = get().refreshToken;

    if (!refreshToken) {
      clearSession();
      set({ user: null, accessToken: null, refreshToken: null });
      return null;
    }

    try {
      const response = await authService.refresh(refreshToken);
      window.localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
      set({ accessToken: response.access_token });
      return response.access_token;
    } catch {
      clearSession();
      set({ user: null, accessToken: null, refreshToken: null });
      return null;
    }
  },

  fetchMe: async () => {
    const accessToken = get().accessToken;

    if (!accessToken) {
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await authService.me(accessToken);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch {
      const nextAccessToken = await get().refresh();

      if (!nextAccessToken) {
        set({ isLoading: false });
        return null;
      }

      const user = await authService.me(nextAccessToken);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    }
  },

  clearError: () => set({ error: null }),
}));

