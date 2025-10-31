import { createContext } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
  nickname?: string;
  birthday?: string; // ISO date from backend
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, opts?: { nickname?: string; birthday?: string }) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
