import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  Clock,
  LayoutDashboard,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import { getApiErrorMessages } from "../../../utils/apiError";
import { formatCurrency } from "../../../utils/format";
import { StatCard } from "../../products/components/StatCard";

const statusColors = {
  Pendiente: "bg-amber-500",
  Confirmado: "bg-sky-500",
    "En Preparacion": "bg-violet-500",
  Enviado: "bg-cacao-500",
  Entregado: "bg-emerald-500",
  Cancelado: "bg-rose-400",
};

const Panel = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-900">
      <Icon size={18} className="text-cacao-700" />
      {title}
    </h2>
    {children}
  </div>
);

const OrdersByStatus = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.cantidad, 0);

  if (total === 0) {
    return <p className="text-sm text-stone-500">Aún no hay pedidos.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const percent = Math.round((item.cantidad / total) * 100);
        return (
          <li key={item.estado}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-stone-700">{item.estado}</span>
              <span className="text-stone-500">
                {item.cantidad} · {percent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full ${statusColors[item.estado] ?? "bg-stone-400"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const TopProducts = ({ state }) => {
  if (state.loading) {
    return <div className="h-32 animate-pulse rounded-lg bg-stone-100" />;
  }

  if (state.error) {
    return <p className="text-sm text-stone-500">{state.error}</p>;
  }

  if (state.items.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no hay ventas registradas.</p>;
  }

  const max = Math.max(...state.items.map((item) => item.unidadesVendidas));

  return (
    <ol className="space-y-3">
      {state.items.map((item) => (
        <li key={item.idProducto} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cacao-100 text-xs font-bold text-cacao-800">
            {item.posicion}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="truncate font-medium text-stone-700">{item.producto}</span>
              <span className="whitespace-nowrap text-stone-500">
                {item.unidadesVendidas} unids. · {formatCurrency(item.ingresos)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-cacao-600"
                style={{ width: `${(item.unidadesVendidas / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
};

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [top, setTop] = useState({ loading: true, items: [], error: null });

  const loadData = useCallback(async () => {
    const [summaryResult, topResult] = await Promise.allSettled([
      dashboardService.getSummary(),
      dashboardService.getTopProducts({ top: 5 }),
    ]);

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value);
      setError(null);
    } else {
      setError(
        getApiErrorMessages(summaryResult.reason, "Error al cargar el resumen de ventas.")[0],
      );
    }

    if (topResult.status === "fulfilled") {
      setTop({ loading: false, items: topResult.value, error: null });
    } else {
      // Mientras top-products no exista en la API, responde 404
      const notAvailable = topResult.reason?.response?.status === 404;
      setTop({
        loading: false,
        items: [],
        error: notAvailable
          ? "Este indicador estará disponible cuando se publique el endpoint de más vendidos."
          : getApiErrorMessages(topResult.reason, "No se pudieron cargar los más vendidos.")[0],
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    setLoading(true);
    setTop((current) => ({ ...current, loading: true }));
    loadData();
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900">
            <LayoutDashboard className="text-cacao-700" size={28} />
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Resumen de ventas y operaciones de la tienda.
          </p>
        </div>
        <button type="button" onClick={handleReload} disabled={loading} className="btn-secondary">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <CircleAlert size={24} />
          </span>
          <p className="text-sm font-medium text-stone-700">{error}</p>
          <button type="button" onClick={handleReload} className="btn-secondary">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      ) : loading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-stone-200" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ShoppingBag} label="Ventas de hoy" value={summary.ventasDelDia} />
            <StatCard icon={Wallet} label="Ingresos de hoy" value={formatCurrency(summary.ingresosDelDia)} tone="emerald" />
            <StatCard icon={CalendarDays} label="Ventas del mes" value={summary.ventasDelMes} />
            <StatCard icon={TrendingUp} label="Ingresos del mes" value={formatCurrency(summary.ingresosDelMes)} tone="emerald" />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Clock} label="Pedidos pendientes" value={summary.pedidosPendientes} tone="amber" />
            <StatCard icon={Receipt} label="Ticket promedio (mes)" value={formatCurrency(summary.ticketPromedioMes)} />
            <StatCard icon={Wallet} label="Ingresos totales" value={formatCurrency(summary.ingresosTotales)} tone="emerald" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel icon={Receipt} title="Pedidos por estado">
              <OrdersByStatus items={summary.pedidosPorEstado ?? []} />
            </Panel>
            <Panel icon={Trophy} title="Productos más vendidos">
              <TopProducts state={top} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};