import { useState } from "react";
import { LoaderCircle, LogOut, Cookie, LayoutDashboard, Package, TicketPercent } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package },
  { id: "promotions", label: "Promociones", icon: TicketPercent },
];

export const AdminLayout = ({ children, section, onNavigate }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      toast.error("No se pudo cerrar la sesión. Intenta de nuevo.");
      setLoggingOut(false);
    }
  };

  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-cacao-900 bg-cacao-800 text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-cacao-900 shadow-inner">
              <Cookie size={22} />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">Chocolates SV</p>
              <p className="hidden text-xs text-cacao-200 sm:block">
                Panel administrativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full bg-cacao-900/60 py-1 pl-1 pr-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cacao-200 text-sm font-bold text-cacao-900">
                {initial}
              </span>
              <span className="hidden max-w-48 truncate text-sm text-cacao-100 sm:block">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-cacao-600 px-3 py-2 text-sm font-semibold text-cacao-50 transition hover:bg-cacao-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

            <nav className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate?.(id)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-cacao-800 text-cacao-800"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        Chocolates SV · Panel administrativo
      </footer>
    </div>
  );
};
