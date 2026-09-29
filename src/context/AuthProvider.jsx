import { useCallback, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "../api/axiosClient";
import { authService } from "../services/authService";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let active = true;

    authService
      .getSession()
      .then((session) => {
        if (active) setUser(session);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setSessionExpired(true);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email, password, remember) => {
    await authService.login(email, password, remember);

    let session;
    try {
      session = await authService.getSession();
    } catch {
      const sessionError = new Error("La sesión no se estableció");
      sessionError.code = "SESSION_NOT_ESTABLISHED";
      throw sessionError;
    }

    setSessionExpired(false);
    setUser(session);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      if (error.response?.status !== 401) {
        throw error;
      }
    }
    setSessionExpired(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checkingSession, sessionExpired, login, logout }),
    [user, checkingSession, sessionExpired, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
