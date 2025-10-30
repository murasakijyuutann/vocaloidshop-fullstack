import { useContext } from "react";
import { AuthContext } from "../context/AuthContextBase";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};