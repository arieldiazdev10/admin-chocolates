import { useContext } from "react";
import { ToastContext } from "../context/toastContext";

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }

  return context;
};
