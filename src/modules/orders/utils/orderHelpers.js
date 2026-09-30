export const ORDER_STATUSES = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Confirmado", label: "Confirmado" },
  { value: "En Preparacion", label: "En Preparación" },
  { value: "Enviado", label: "Enviado" },
  { value: "Entregado", label: "Entregado" },
  { value: "Cancelado", label: "Cancelado" },
];

export const IN_PROGRESS_STATUSES = ["Confirmado", "En Preparacion", "Enviado"];

export const ORDER_STATUS_STYLES = {
  Pendiente: "bg-amber-50 text-amber-700",
  Confirmado: "bg-sky-50 text-sky-700",
  "En Preparacion": "bg-violet-50 text-violet-700",
  Enviado: "bg-cacao-100 text-cacao-800",
  Entregado: "bg-emerald-50 text-emerald-700",
  Cancelado: "bg-rose-50 text-rose-700",
};

export const getStatusLabel = (estado) =>
  ORDER_STATUSES.find((status) => status.value === estado)?.label ?? estado;

const HAS_OFFSET = /(Z|[+-]\d{2}:\d{2})$/i;

const parseServerDateTime = (value) => {
  const normalized = String(value).replace(/(\.\d{3})\d+/, "$1");
  return new Date(HAS_OFFSET.test(normalized) ? normalized : `${normalized}Z`);
};

export const formatDateTime = (value) => {
  if (!value) return "—";

  const date = parseServerDateTime(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDeliveryDate = (value) => {
  if (!value) return "—";

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
