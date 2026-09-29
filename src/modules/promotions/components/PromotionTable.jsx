import { Pencil, Trash2 } from "lucide-react";
import {
  formatDate,
  formatDiscount,
  getPromotionStatus,
  getTypeLabel,
} from "../utils/promotionHelpers";

const statusStyles = {
  Vigente: "bg-emerald-50 text-emerald-700",
  Programada: "bg-sky-50 text-sky-700",
  Vencida: "bg-stone-100 text-stone-500",
  Inactiva: "bg-rose-50 text-rose-700",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
    {status}
  </span>
);

const UsageText = ({ promotion }) => {
  if (promotion.tipo !== "Cupon") {
    return <span className="text-stone-400">—</span>;
  }
  return (
    <span className="whitespace-nowrap">
      {promotion.usosRealizados ?? 0}
      {promotion.limiteUsos ? ` / ${promotion.limiteUsos}` : " / ∞"}
    </span>
  );
};

export const PromotionTable = ({ promotions, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <th className="px-6 py-3.5">Promoción</th>
          <th className="hidden px-6 py-3.5 md:table-cell">Tipo</th>
          <th className="px-6 py-3.5">Descuento</th>
          <th className="hidden px-6 py-3.5 lg:table-cell">Vigencia</th>
          <th className="hidden px-6 py-3.5 sm:table-cell">Usos</th>
          <th className="px-6 py-3.5">Estado</th>
          <th className="px-6 py-3.5 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
        {promotions.map((promotion) => (
          <tr key={promotion.id} className="transition-colors hover:bg-cacao-50/60">
            <td className="px-6 py-4">
              <p className="font-semibold text-stone-900">{promotion.nombre}</p>
              <p className="line-clamp-1 max-w-xs text-xs text-stone-500">
                {promotion.descripcion || "Sin descripción"}
              </p>
              {promotion.cupon && (
                <span className="mt-1 inline-flex rounded border border-dashed border-cacao-300 bg-cacao-50 px-2 py-0.5 font-mono text-xs font-semibold text-cacao-800">
                  {promotion.cupon}
                </span>
              )}
            </td>
            <td className="hidden px-6 py-4 md:table-cell">
              <span className="inline-flex rounded-full bg-cacao-100 px-2.5 py-1 text-xs font-semibold text-cacao-800">
                {getTypeLabel(promotion.tipo)}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-stone-900">
              {formatDiscount(promotion)}
            </td>
            <td className="hidden whitespace-nowrap px-6 py-4 text-xs lg:table-cell">
              {formatDate(promotion.fechaInicio)} – {formatDate(promotion.fechaFin)}
            </td>
            <td className="hidden px-6 py-4 sm:table-cell">
              <UsageText promotion={promotion} />
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={getPromotionStatus(promotion)} />
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(promotion)}
                  aria-label={`Editar ${promotion.nombre}`}
                  className="rounded-lg p-2 text-stone-500 transition hover:bg-cacao-100 hover:text-cacao-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(promotion)}
                  aria-label={`Eliminar ${promotion.nombre}`}
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

export const PromotionTableSkeleton = () => (
  <div className="divide-y divide-stone-100" aria-busy="true">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
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