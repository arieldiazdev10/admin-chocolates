import { formatCurrency } from "../../../utils/format";

export const PROMOTION_TYPES = [
  { value: "Temporada", label: "Temporada" },
  { value: "Producto", label: "Por producto" },
  { value: "Categoria", label: "Por categoría" },
  { value: "Combo", label: "Combo" },
  { value: "Cupon", label: "Cupón" },
];

export const DISCOUNT_TYPES = [
  { value: "Porcentaje", label: "Porcentaje (%)" },
  { value: "MontoFijo", label: "Monto fijo ($)" },
];

export const PROMOTION_STATUSES = ["Vigente", "Programada", "Vencida", "Inactiva"];

export const getTypeLabel = (tipo) =>
  PROMOTION_TYPES.find((type) => type.value === tipo)?.label ?? tipo;

// "2026-09-01T00:00:00" -> "2026-09-01"
export const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

// "2026-09-01" -> Date local (evita el desfase de zona horaria)
const toLocalDate = (value) => {
  const [year, month, day] = toDateInput(value).split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (value) =>
  value
    ? toLocalDate(value).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const getPromotionStatus = (promotion) => {
  if (!promotion.activa) return "Inactiva";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (toLocalDate(promotion.fechaInicio) > today) return "Programada";
  if (toLocalDate(promotion.fechaFin) < today) return "Vencida";
  return "Vigente";
};

export const formatDiscount = (promotion) => {
  if (promotion.tipo === "Combo" && promotion.precioCombo != null) {
    return `Combo a ${formatCurrency(promotion.precioCombo)}`;
  }

  return promotion.tipoDescuento === "Porcentaje"
    ? `${Number(promotion.descuento)}%`
    : formatCurrency(promotion.descuento);
};