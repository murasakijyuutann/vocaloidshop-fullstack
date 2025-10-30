import { useContext } from "react";
import { ToastContext } from "../context/ToastContextBase";

export const useToast = () => useContext(ToastContext);
