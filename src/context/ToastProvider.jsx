import { useCallback, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { ToastContext } from "./toastContext";

const TOAST_DURATION = 4500;

const variants = {
  success: {
    icon: CircleCheck,
    style: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconStyle: "text-emerald-600",
  },
  error: {
    icon: CircleAlert,
    style: "border-rose-200 bg-rose-50 text-rose-800",
    iconStyle: "text-rose-600",
  },
  info: {
    icon: Info,
    style: "border-amber-200 bg-amber-50 text-amber-900",
    iconStyle: "text-amber-600",
  },
};

let nextToastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      nextToastId += 1;
      const id = nextToastId;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96"
      >
        {toasts.map((toast) => {
          const variant = variants[toast.type];
          const Icon = variant.icon;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 text-sm shadow-lg ${variant.style}`}
            >
              <Icon size={20} className={`mt-0.5 shrink-0 ${variant.iconStyle}`} />
              <p className="flex-1 font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 opacity-60 transition hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
