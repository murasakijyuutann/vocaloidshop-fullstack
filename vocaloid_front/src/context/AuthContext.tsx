import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContextBase";
import type { User } from "./AuthContextBase";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // Keep axios auth header in sync with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get("/auth/me").then(res => setUser(res.data)).catch(() => logout());
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const register = async (email: string, password: string, opts?: { nickname?: string; birthday?: string }) => {
    const payload: { email: string; password: string; nickname?: string; birthday?: string } = { email, password };
    if (opts?.nickname) payload.nickname = opts.nickname;
    if (opts?.birthday) payload.birthday = opts.birthday; // yyyy-MM-dd
    const res = await axios.post("/auth/register", payload);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const refresh = async () => {
    if (!token) return;
    const res = await axios.get("/auth/me");
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

