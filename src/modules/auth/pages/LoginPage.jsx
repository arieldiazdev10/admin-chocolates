import { useState } from "react";
import {
  CircleAlert,
  Cookie,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

const getLoginErrorMessage = (error) => {
  if (error?.code === "SESSION_NOT_ESTABLISHED") {
    return "El inicio de sesión fue correcto, pero el navegador no guardó la cookie de sesión. Verifica que la API se abra por HTTPS y que las cookies de terceros no estén bloqueadas.";
  }

  const response = error?.response;

  if (!response) {
    return "No se pudo conectar con el servidor. Verifica que la API esté en ejecución.";
  }

  if (response.status === 401) {
    const detail = response.data?.detail;

    if (detail === "LockedOut") {
      return "Tu cuenta está bloqueada temporalmente por demasiados intentos. Inténtalo más tarde.";
    }

    if (detail === "NotAllowed") {
      return "Tu cuenta aún no está habilitada para iniciar sesión.";
    }

    return "Correo o contraseña incorrectos.";
  }

  return "Ocurrió un error al iniciar sesión. Intenta de nuevo.";
};

const highlights = [
  { icon: PackageCheck, text: "Controla tu inventario y catálogo en tiempo real" },
  { icon: Star, text: "Destaca los productos estrella de la tienda" },
  { icon: ShieldCheck, text: "Acceso seguro solo para administradores" },
];

export const LoginPage = () => {
  const { login, sessionExpired } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password, remember);
    } catch (err) {
      setError(getLoginErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-cacao-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cacao-800/70" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cacao-950/60" />

        <div className="relative flex items-center gap-3 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-cacao-900">
            <Cookie size={26} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Chocolates SV</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Administra tu chocolatería con dulzura y control.
          </h1>
          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-cacao-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cacao-800 text-amber-300">
                  <Icon size={20} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-cacao-300">
          © {new Date().getFullYear()} Chocolates SV
        </p>
      </aside>

      <main className="flex items-center justify-center bg-stone-50 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cacao-800 text-amber-300">
              <Cookie size={24} />
            </div>
            <span className="text-xl font-bold text-cacao-900">Chocolates SV</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-stone-900">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Inicia sesión con tu cuenta de administrador para continuar.
          </p>

          {sessionExpired && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              <Info size={18} className="mt-0.5 shrink-0" />
              Tu sesión expiró. Inicia sesión nuevamente para continuar.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="field-label">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="field-input pl-10"
                  placeholder="admin@chocolatessv.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="field-input pl-10 pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-cacao-800"
              />
              Mantener la sesión iniciada
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}
              {loading ? "Iniciando sesión..." : "Entrar al panel"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
