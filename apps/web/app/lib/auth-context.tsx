"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiGet,
  apiSend,
  clearAuthToken,
  getAuthToken,
  loginWithToken,
  onAuthTokenChange,
} from "./api";

export type AuthUser = {
  id: string;
  username: string;
  isSuperadmin: boolean;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
};

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  // True while we don't know yet (initial /me call in flight).
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    status: "loading",
    user: null,
  }));

  const fetchMe = useCallback(async () => {
    try {
      const response = await apiGet<{ user: AuthUser }>("auth/me");
      setState({ status: "authenticated", user: response.user });
    } catch {
      // Either no token or token rejected. apiGet already cleared the token
      // on a 401, so just mark as anonymous.
      setState({ status: "anonymous", user: null });
    }
  }, []);

  // Initial check + react to token changes (login/logout/expiry).
  useEffect(() => {
    if (getAuthToken()) {
      void fetchMe();
    } else {
      setState({ status: "anonymous", user: null });
    }

    const off = onAuthTokenChange((token) => {
      if (token) {
        setState({ status: "loading", user: null });
        void fetchMe();
      } else {
        setState({ status: "anonymous", user: null });
      }
    });

    return () => {
      off();
    };
  }, [fetchMe]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiSend<{ token: string; user: AuthUser }>(
      "auth/login",
      "POST",
      { username, password },
    );
    loginWithToken(response.token);
    setState({ status: "authenticated", user: response.user });
    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setState({ status: "anonymous", user: null });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = state.status === "authenticated" ? state.user : null;
    const ownedPermissions = user?.role?.permissions ?? [];

    const hasPermission = (permission: string) => {
      if (!user) return false;
      if (user.isSuperadmin) return true;
      return ownedPermissions.includes(permission);
    };

    return {
      state,
      user,
      loading: state.status === "loading",
      isAuthenticated: state.status === "authenticated",
      hasPermission,
      hasAnyPermission: (permissions) => permissions.some(hasPermission),
      login,
      logout,
      refresh: fetchMe,
    };
  }, [state, login, logout, fetchMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return ctx;
}
