import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent, CalendarRange, CircleAlert, CircleOff,
  Plus, RefreshCw, Search, Ticket, TicketPercent,
} from "lucide-react";
import { promotionService } from "../../../services/promotionService";
import { productService } from "../../../services/productService";
import { categoryService } from "../../../services/categoryService";
import { useToast } from "../../../hooks/useToast";
import { getApiErrorMessages } from "../../../utils/apiError";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { StatCard } from "../../products/components/StatCard";
import { CouponTester } from "../components/CouponTester";
import { PromotionFormModal } from "../components/PromotionFormModal";
import { PromotionTable, PromotionTableSkeleton } from "../components/PromotionTable";
import { PROMOTION_STATUSES, PROMOTION_TYPES, getPromotionStatus } from "../utils/promotionHelpers";

export const PromotionAdminPage = () => {
  const toast = useToast();
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formState, setFormState] = useState({ open: false, promotion: null });
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    const [promotionsResult, productsResult, categoriesResult] = await Promise.allSettled([
      promotionService.getAll(),
      productService.getAll(),
      categoryService.getAll(),
    ]);

    if (promotionsResult.status === "fulfilled") {
      setPromotions(promotionsResult.value);
      setError(null);
    } else {
      setError(getApiErrorMessages(promotionsResult.reason, "Error al cargar las promociones.")[0]);
    }

    if (productsResult.status === "fulfilled") setProducts(productsResult.value);
    if (categoriesResult.status === "fulfilled") setCategories(categoriesResult.value);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    setLoading(true);
    loadData();
  };

  const filteredPromotions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return promotions.filter((promotion) => {
      const matchesSearch =
        !term ||
        (promotion.nombre ?? "").toLowerCase().includes(term) ||
        (promotion.cupon ?? "").toLowerCase().includes(term);
      const matchesType = !typeFilter || promotion.tipo === typeFilter;
      const matchesStatus = !statusFilter || getPromotionStatus(promotion) === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [promotions, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const statuses = promotions.map(getPromotionStatus);
    return {
      total: promotions.length,
      current: statuses.filter((status) => status === "Vigente").length,
      coupons: promotions.filter((promotion) => promotion.tipo === "Cupon").length,
      inactive: statuses.filter((status) => status === "Inactiva" || status === "Vencida").length,
    };
  }, [promotions]);

  const openForm = (promotion = null) => setFormState({ open: true, promotion });
  const closeForm = useCallback(() => setFormState({ open: false, promotion: null }), []);

  const handleSaved = async (message) => {
    closeForm();
    toast.success(message);
    await loadData();
  };

  const closeDelete = useCallback(() => setPromotionToDelete(null), []);

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;

    setDeleting(true);
    try {
      await promotionService.delete(promotionToDelete.id);
      setPromotions((current) => current.filter((promotion) => promotion.id !== promotionToDelete.id));
      toast.success(`"${promotionToDelete.nombre}" fue eliminada`);
      setPromotionToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessages(err, "No se pudo eliminar la promoción.")[0]);
      if (err.response?.status === 404) {
        setPromotionToDelete(null);
        await loadData();
      }
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search.trim() || typeFilter || statusFilter);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900">
            <TicketPercent className="text-cacao-700" size={28} />
            Promociones
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Administra ofertas de temporada, combos, descuentos y cupones.
          </p>
        </div>
        <button type="button" onClick={() => openForm()} className="btn-primary">
          <Plus size={18} /> Nueva promoción
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BadgePercent} label="Promociones" value={stats.total} />
        <StatCard icon={CalendarRange} label="Vigentes hoy" value={stats.current} tone="emerald" />
        <StatCard icon={Ticket} label="Cupones" value={stats.coupons} tone="amber" />
        <StatCard icon={CircleOff} label="Inactivas o vencidas" value={stats.inactive} tone="rose" />
      </div>

      <CouponTester />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o cupón..." aria-label="Buscar promoción"
              className="field-input pl-10"
            />
          </div>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filtrar por tipo" className="field-input sm:w-44">
            <option value="">Todos los tipos</option>
            {PROMOTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado" className="field-input sm:w-44">
            <option value="">Todos los estados</option>
            {PROMOTION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" onClick={handleReload} disabled={loading} aria-label="Recargar promociones" className="btn-secondary">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden">Recargar</span>
          </button>
        </div>

        {loading ? (
          <PromotionTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <CircleAlert size={24} />
            </span>
            <p className="text-sm font-medium text-stone-700">{error}</p>
            <button type="button" onClick={handleReload} className="btn-secondary">
              <RefreshCw size={16} /> Reintentar
            </button>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cacao-100 text-cacao-700">
              <TicketPercent size={24} />
            </span>
            <p className="text-sm font-medium text-stone-700">
              {hasFilters ? "Ninguna promoción coincide con los filtros aplicados." : "Aún no hay promociones registradas."}
            </p>
            {hasFilters ? (
              <button type="button" onClick={clearFilters} className="btn-secondary">Limpiar filtros</button>
            ) : (
              <button type="button" onClick={() => openForm()} className="btn-primary">
                <Plus size={16} /> Crear la primera promoción
              </button>
            )}
          </div>
        ) : (
          <>
            <PromotionTable promotions={filteredPromotions} onEdit={openForm} onDelete={setPromotionToDelete} />
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 text-xs text-stone-500">
              Mostrando {filteredPromotions.length} de {promotions.length} promociones
            </div>
          </>
        )}
      </div>

      {formState.open && (
        <PromotionFormModal
          key={formState.promotion?.id ?? "new"}
          promotion={formState.promotion}
          products={products}
          categories={categories}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      {promotionToDelete && (
        <ConfirmDialog
          title="Eliminar promoción"
          message={`¿Seguro que deseas eliminar "${promotionToDelete.nombre}"? Esta acción no se puede deshacer. Si solo quieres pausarla, edítala y desmarca "Promoción activa".`}
          confirmLabel="Eliminar"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  );
};