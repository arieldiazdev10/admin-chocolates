import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  Clock,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { orderService } from "../../../services/orderService";
import { useToast } from "../../../hooks/useToast";
import { getApiErrorMessages } from "../../../utils/apiError";
import { formatCurrency } from "../../../utils/format";
import { StatCard } from "../../products/components/StatCard";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { OrderTable, OrderTableSkeleton } from "../components/OrderTable";
import {
  IN_PROGRESS_STATUSES,
  ORDER_STATUSES,
  getStatusLabel,
} from "../utils/orderHelpers";

export const OrderAdminPage = () => {
  const toast = useToast();
  const requestId = useRef(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    const currentRequest = ++requestId.current;

    try {
      const data = await orderService.getAll({
        estado,
        fechaDesde,
        fechaHasta,
      });
      if (currentRequest !== requestId.current) return;
      setOrders(data);
      setError(null);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(getApiErrorMessages(err, "Error al cargar los pedidos.")[0]);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [estado, fechaDesde, fechaHasta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    setLoading(true);
    loadData();
  };

  const handleEstadoChange = (event) => {
    setLoading(true);
    setEstado(event.target.value);
  };

  const handleFechaDesdeChange = (event) => {
    setLoading(true);
    setFechaDesde(event.target.value);
  };

  const handleFechaHastaChange = (event) => {
    setLoading(true);
    setFechaHasta(event.target.value);
  };

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter(
      (order) =>
        (order.numeroOrden ?? "").toLowerCase().includes(term) ||
        (order.cliente ?? "").toLowerCase().includes(term) ||
        (order.correo ?? "").toLowerCase().includes(term),
    );
  }, [orders, search]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.estado === "Pendiente").length,
      inProgress: orders.filter((order) =>
        IN_PROGRESS_STATUSES.includes(order.estado),
      ).length,
      sales: orders
        .filter((order) => order.estado !== "Cancelado")
        .reduce((sum, order) => sum + (order.total ?? 0), 0),
    }),
    [orders],
  );

  const closeDetail = useCallback(() => setSelected(null), []);

  const handleMissing = useCallback(() => {
    setSelected(null);
    toast.error("El pedido ya no existe.");
    setLoading(true);
    loadData();
  }, [toast, loadData]);

  const handleStatusChanged = useCallback(
    (updated) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === updated.id
            ? { ...order, estado: updated.estado }
            : order,
        ),
      );
      toast.success(
        `Pedido ${updated.numeroOrden} actualizado a ${getStatusLabel(updated.estado)}`,
      );
    },
    [toast],
  );

  const hasFilters = Boolean(
    search.trim() || estado || fechaDesde || fechaHasta,
  );

  const clearFilters = () => {
    if (estado || fechaDesde || fechaHasta) setLoading(true);
    setSearch("");
    setEstado("");
    setFechaDesde("");
    setFechaHasta("");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900">
            <ShoppingBag className="text-cacao-700" size={28} />
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Consulta los pedidos de la tienda y actualiza su estado.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Pedidos" value={stats.total} />
        <StatCard
          icon={Clock}
          label="Pendientes"
          value={stats.pending}
          tone="amber"
        />
        <StatCard icon={Truck} label="En curso" value={stats.inProgress} />
        <StatCard
          icon={Wallet}
          label="Ventas (sin cancelados)"
          value={formatCurrency(stats.sales)}
          tone="emerald"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por orden, cliente o correo..."
                aria-label="Buscar pedido"
                className="field-input pl-10"
              />
            </div>
            <select
              value={estado}
              onChange={handleEstadoChange}
              aria-label="Filtrar por estado"
              className="field-input sm:w-48"
            >
              <option value="">Todos los estados</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReload}
              disabled={loading}
              aria-label="Recargar pedidos"
              className="btn-secondary"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="sm:hidden">Recargar</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Desde
              <input
                type="date"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={handleFechaDesdeChange}
                className="field-input sm:w-44"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Hasta
              <input
                type="date"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={handleFechaHastaChange}
                className="field-input sm:w-44"
              />
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-cacao-700 transition hover:text-cacao-900 sm:ml-auto"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <OrderTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <CircleAlert size={24} />
            </span>
            <p className="text-sm font-medium text-stone-700">{error}</p>
            <button
              type="button"
              onClick={handleReload}
              className="btn-secondary"
            >
              <RefreshCw size={16} /> Reintentar
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cacao-100 text-cacao-700">
              <PackageSearch size={24} />
            </span>
            <p className="text-sm font-medium text-stone-700">
              {hasFilters
                ? "Ningún pedido coincide con los filtros aplicados."
                : "Aún no hay pedidos registrados."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <OrderTable orders={filteredOrders} onView={setSelected} />
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 text-xs text-stone-500">
              Mostrando {filteredOrders.length} de {orders.length} pedidos
            </div>
          </>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          key={selected.id}
          orderId={selected.id}
          orderCode={selected.numeroOrden}
          onClose={closeDetail}
          onStatusChanged={handleStatusChanged}
          onMissing={handleMissing}
        />
      )}
    </div>
  );
};
