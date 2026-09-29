import { ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import { LOW_STOCK_THRESHOLD, formatCurrency } from "../../../utils/format";

const StockBadge = ({ stock }) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
        Agotado
      </span>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        {stock} unids. · Bajo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      {stock} unids.
    </span>
  );
};

const ProductImage = ({ url, name }) => {
  if (!url) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-300">
        <ImageOff size={18} />
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover"
    />
  );
};

export const ProductTable = ({ products, categoryMap, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <th className="px-6 py-3.5">Producto</th>
          <th className="hidden px-6 py-3.5 md:table-cell">Categoría</th>
          <th className="px-6 py-3.5">Precio</th>
          <th className="px-6 py-3.5">Stock</th>
          <th className="hidden px-6 py-3.5 text-center sm:table-cell">
            Destacado
          </th>
          <th className="px-6 py-3.5 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
        {products.map((product) => (
          <tr key={product.id} className="transition-colors hover:bg-cacao-50/60">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <ProductImage url={product.imagenUrl} name={product.nombre} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">
                    {product.nombre}
                  </p>
                  <p className="line-clamp-1 max-w-xs text-xs text-stone-500">
                    {product.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>
            </td>
            <td className="hidden px-6 py-4 md:table-cell">
              <span className="inline-flex rounded-full bg-cacao-100 px-2.5 py-1 text-xs font-semibold text-cacao-800">
                {categoryMap.get(product.idCategoria) ??
                  `Categoría #${product.idCategoria}`}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-stone-900">
              {formatCurrency(product.precio)}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              <StockBadge stock={product.stock ?? 0} />
            </td>
            <td className="hidden px-6 py-4 text-center sm:table-cell">
              {product.esDestacado ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  Sí
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
                  No
                </span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  aria-label={`Editar ${product.nombre}`}
                  className="rounded-lg p-2 text-stone-500 transition hover:bg-cacao-100 hover:text-cacao-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  aria-label={`Eliminar ${product.nombre}`}
                  className="rounded-lg p-2 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ProductTableSkeleton = () => (
  <div className="divide-y divide-stone-100" aria-busy="true">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
        <div className="h-12 w-12 rounded-lg bg-stone-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded bg-stone-200" />
          <div className="h-3 w-1/2 rounded bg-stone-100" />
        </div>
        <div className="hidden h-6 w-20 rounded-full bg-stone-200 sm:block" />
        <div className="h-6 w-16 rounded bg-stone-200" />
      </div>
    ))}
  </div>
);
