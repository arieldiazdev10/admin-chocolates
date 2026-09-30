import { Eye } from "lucide-react";
import { formatCurrency } from "../../../utils/format";
import { formatDateTime, formatDeliveryDate } from "../utils/orderHelpers";
import { OrderStatusBadge } from "./OrderStatusBadge";

export const OrderTable = ({ orders, onView }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <th className="px-6 py-3.5">Pedido</th>
          <th className="hidden px-6 py-3.5 md:table-cell">Cliente</th>
          <th className="hidden px-6 py-3.5 lg:table-cell">Creado</th>
          <th className="hidden px-6 py-3.5 sm:table-cell">Entrega</th>
          <th className="px-6 py-3.5">Total</th>
          <th className="px-6 py-3.5">Estado</th>
          <th className="px-6 py-3.5 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
        {orders.map((order) => (
          <tr key={order.id} className="transition-colors hover:bg-cacao-50/60">
            <td className="px-6 py-4">
              <button
                type="button"
                onClick={() => onView(order)}
                className="rounded border border-dashed border-cacao-300 bg-cacao-50 px-2 py-0.5 font-mono text-xs font-semibold text-cacao-800 transition hover:bg-cacao-100"
              >
                {order.numeroOrden}
              </button>
              <p className="mt-1 truncate text-xs text-stone-500 md:hidden">
                {order.cliente}
              </p>
            </td>
            <td className="hidden px-6 py-4 md:table-cell">
              <p className="font-semibold text-stone-900">{order.cliente}</p>
              <p className="max-w-56 truncate text-xs text-stone-500">
                {order.correo}
              </p>
            </td>
            <td className="hidden whitespace-nowrap px-6 py-4 text-xs lg:table-cell">
              {formatDateTime(order.fechaCreacion)}
            </td>
            <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
              {formatDeliveryDate(order.fechaEntrega)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-stone-900">
              {formatCurrency(order.total)}
            </td>
            <td className="px-6 py-4">
              <OrderStatusBadge status={order.estado} />
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onView(order)}
                  aria-label={`Ver detalle del pedido ${order.numeroOrden}`}
                  className="rounded-lg p-2 text-stone-500 transition hover:bg-cacao-100 hover:text-cacao-800"
                >
                  <Eye size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const OrderTableSkeleton = () => (
  <div className="divide-y divide-stone-100" aria-busy="true">
    {Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        className="flex animate-pulse items-center gap-4 px-6 py-4"
      >
        <div className="h-6 w-40 rounded bg-stone-200" />
        <div className="hidden flex-1 space-y-2 md:block">
          <div className="h-3.5 w-1/3 rounded bg-stone-200" />
          <div className="h-3 w-1/2 rounded bg-stone-100" />
        </div>
        <div className="ml-auto h-6 w-16 rounded bg-stone-200" />
        <div className="h-6 w-20 rounded-full bg-stone-200" />
      </div>
    ))}
  </div>
);
