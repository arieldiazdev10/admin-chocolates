import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleAlert,
  Package,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  Star,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { productService } from "../../../services/productService";
import { categoryService } from "../../../services/categoryService";
import { useToast } from "../../../hooks/useToast";
import { getApiErrorMessages } from "../../../utils/apiError";
import { LOW_STOCK_THRESHOLD, formatCurrency } from "../../../utils/format";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ProductFormModal } from "../components/ProductFormModal";
import { ProductTable, ProductTableSkeleton } from "../components/ProductTable";
import { StatCard } from "../components/StatCard";

export const ProductAdminPage = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formState, setFormState] = useState({ open: false, product: null });
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      productService.getAll(),
      categoryService.getAll(),
    ]);

    if (productsResult.status === "fulfilled") {
      setProducts(productsResult.value);
      setError(null);
    } else {
      setError(
        getApiErrorMessages(
          productsResult.reason,
          "Error al cargar los productos.",
        )[0],
      );
    }

    if (categoriesResult.status === "fulfilled") {
      setCategories(categoriesResult.value);
    } else {
      toast.error("No se pudieron cargar las categorías.");
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    setLoading(true);
    loadData();
  };

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.nombre])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term || (product.nombre ?? "").toLowerCase().includes(term);
      const matchesCategory =
        !categoryFilter || product.idCategoria === Number(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      featured: products.filter((product) => product.esDestacado).length,
      lowStock: products.filter(
        (product) => (product.stock ?? 0) <= LOW_STOCK_THRESHOLD,
      ).length,
      inventoryValue: products.reduce(
        (sum, product) => sum + (product.precio ?? 0) * (product.stock ?? 0),
        0,
      ),
    }),
    [products],
  );

  const openForm = (product = null) => setFormState({ open: true, product });
  const closeForm = useCallback(
    () => setFormState({ open: false, product: null }),
    [],
  );

  const handleSaved = async (message) => {
    closeForm();
    toast.success(message);
    await loadData();
  };

  const closeDelete = useCallback(() => setProductToDelete(null), []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      await productService.delete(productToDelete.id);
      setProducts((current) =>
        current.filter((product) => product.id !== productToDelete.id),
      );
      toast.success(`"${productToDelete.nombre}" fue eliminado del catálogo`);
      setProductToDelete(null);
    } catch (err) {
      toast.error(
        getApiErrorMessages(err, "No se pudo eliminar el producto.")[0],
      );
      if (err.response?.status === 404) {
        setProductToDelete(null);
        await loadData();
      }
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search.trim() || categoryFilter);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900">
            <Package className="text-cacao-700" size={28} />
            Productos
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Gestiona el inventario y el catálogo activo de la tienda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="btn-primary"
        >
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Productos activos" value={stats.total} />
        <StatCard
          icon={Star}
          label="Destacados"
          value={stats.featured}
          tone="amber"
        />
        <StatCard
          icon={TriangleAlert}
          label="Stock bajo o agotado"
          value={stats.lowStock}
          tone="rose"
        />
        <StatCard
          icon={Wallet}
          label="Valor del inventario"
          value={formatCurrency(stats.inventoryValue)}
          tone="emerald"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto por nombre..."
              aria-label="Buscar producto por nombre"
              className="field-input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filtrar por categoría"
            className="field-input sm:w-56"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleReload}
            disabled={loading}
            aria-label="Recargar productos"
            className="btn-secondary"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden">Recargar</span>
          </button>
        </div>

        {loading ? (
          <ProductTableSkeleton />
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
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cacao-100 text-cacao-700">
              <PackageSearch size={24} />
            </span>
            <p className="text-sm font-medium text-stone-700">
              {hasFilters
                ? "Ningún producto coincide con los filtros aplicados."
                : "Aún no hay productos activos registrados."}
            </p>
            {hasFilters ? (
              <button type="button" onClick={clearFilters} className="btn-secondary">
                Limpiar filtros
              </button>
            ) : (
              <button type="button" onClick={() => openForm()} className="btn-primary">
                <Plus size={16} /> Agregar el primer producto
              </button>
            )}
          </div>
        ) : (
          <>
            <ProductTable
              products={filteredProducts}
              categoryMap={categoryMap}
              onEdit={openForm}
              onDelete={setProductToDelete}
            />
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 text-xs text-stone-500">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>
          </>
        )}
      </div>

      {formState.open && (
        <ProductFormModal
          key={formState.product?.id ?? "new"}
          product={formState.product}
          categories={categories}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      {productToDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Seguro que deseas eliminar "${productToDelete.nombre}"? Dejará de mostrarse en el catálogo activo.`}
          confirmLabel="Eliminar"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  );
};
