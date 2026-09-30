import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { orderService } from "../../../services/orderService";
import { getApiErrorMessages } from "../../../utils/apiError";
import { formatCurrency } from "../../../utils/format";
import {
  formatDateTime,
  formatDeliveryDate,
  getStatusLabel,
} from "../utils/orderHelpers";
import { OrderStatusBadge } from "./OrderStatusBadge";

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <Icon size={16} className="mt-0.5 shrink-0 text-cacao-600" />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <div className="break-words text-sm text-stone-800">{children}</div>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4 px-6 py-5" aria-busy="true">
    <div className="h-4 w-1/2 rounded bg-stone-200" />
    <div className="h-4 w-2/3 rounded bg-stone-100" />
    <div className="h-24 rounded-lg bg-stone-100" />
    <div className="h-16 rounded-lg bg-stone-100" />
  </div>
);

export const OrderDetailModal = ({
  orderId,
  orderCode,
  onClose,
  onStatusChanged,
  onMissing,
}) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let active = true;

    orderService
      .getById(orderId)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 404) {
          onMissing();
          return;
        }
        setLoadError(
          getApiErrorMessages(error, "No se pudo cargar el pedido.")[0],
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, onMissing]);

  const handleConfirm = async () => {
    setUpdating(true);
    setActionError(null);

    try {
      const updated = await orderService.updateStatus(order.id, pendingStatus);
      setOrder(updated);
      setPendingStatus(null);
      onStatusChanged(updated);
    } catch (error) {
      const status = error.response?.status;
      setActionError(
        getApiErrorMessages(error, "No se pudo actualizar el estado.")[0],
      );
      setPendingStatus(null);

      if (status === 404) {
        onMissing();
      } else if (status === 409) {
        orderService
          .getById(order.id)
          .then((fresh) => {
            setOrder(fresh);
            onStatusChanged(fresh);
          })
          .catch(() => null);
      }
    } finally {
      setUpdating(false);
    }
  };

  const isCancel = pendingStatus === "Cancelado";

  return (
    <Modal
      title="Detalle del pedido"
      description={orderCode}
      onClose={onClose}
      dismissible={!updating}
    >
      {loading ? (
        <DetailSkeleton />
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <CircleAlert size={24} />
          </span>
          <p className="text-sm font-medium text-stone-700">{loadError}</p>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      ) : (
        order && (
          <>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {actionError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  <CircleAlert size={18} className="mt-0.5 shrink-0" />
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Estado actual
                </span>
                <OrderStatusBadge status={order.estado} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={User} label="Cliente">
                  {order.cliente}
                </InfoRow>
                <InfoRow icon={Mail} label="Correo">
                  {order.correo}
                </InfoRow>
                <InfoRow icon={Phone} label="Teléfono">
                  {order.telefono || "—"}
                </InfoRow>
                <InfoRow icon={CalendarDays} label="Entrega">
                  {formatDeliveryDate(order.fechaEntrega)}
                </InfoRow>
                <InfoRow icon={CreditCard} label="Pago">
                  {order.metodoPago}
                  {order.referenciaPago ? ` · ${order.referenciaPago}` : ""}
                </InfoRow>
                <InfoRow icon={CalendarDays} label="Creado">
                  {formatDateTime(order.fechaCreacion)}
                </InfoRow>
              </div>

              {order.comentarios && (
                <InfoRow icon={MessageSquare} label="Comentarios">
                  {order.comentarios}
                </InfoRow>
              )}

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Productos
                </h3>
                <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                  {order.detalles.map((item, index) => (
                    <li
                      key={`${item.productoId}-${index}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-900">
                          {item.nombreProducto}
                        </p>
                        <p className="text-xs text-stone-500">
                          {item.cantidad} ×{" "}
                          {formatCurrency(item.precioUnitario)}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-semibold text-stone-900">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(order.subtotal)}</dd>
                </div>
                {order.descuento > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Descuento</dt>
                    <dd>-{formatCurrency(order.descuento)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-stone-100 bg-stone-50 px-6 py-4 sm:rounded-b-2xl">
              {pendingStatus ? (
                <div className="space-y-3">
                  <p className="text-sm text-stone-700">
                    ¿Cambiar el estado del pedido a{" "}
                    <strong>{getStatusLabel(pendingStatus)}</strong>?
                    {isCancel &&
                      " Se devolverán al inventario las existencias de los productos."}
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPendingStatus(null)}
                      disabled={updating}
                      className="btn-secondary"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={updating}
                      className={isCancel ? "btn-danger" : "btn-primary"}
                    >
                      {updating && (
                        <LoaderCircle size={16} className="animate-spin" />
                      )}
                      Confirmar
                    </button>
                  </div>
                </div>
              ) : order.siguientesEstados.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Cambiar estado a
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.siguientesEstados.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setPendingStatus(status);
                        }}
                        className={
                          status === "Cancelado"
                            ? "btn-secondary text-rose-700"
                            : "btn-primary"
                        }
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Este pedido está en un estado final y ya no puede cambiar.
                </p>
              )}
            </div>
          </>
        )
      )}
    </Modal>
  );
};
