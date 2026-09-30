import { ORDER_STATUS_STYLES, getStatusLabel } from "../utils/orderHelpers";

export const OrderStatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
      ORDER_STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600"
    }`}
  >
    {getStatusLabel(status)}
  </span>
);
