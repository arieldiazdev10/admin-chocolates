import { useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Ticket } from "lucide-react";
import { promotionService } from "../../../services/promotionService";
import { getApiErrorMessages } from "../../../utils/apiError";
import { formatCurrency } from "../../../utils/format";

export const CouponTester = () => {
  const [codigo, setCodigo] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTesting(true);
    setResult(null);

    try {
      const data = await promotionService.validateCoupon(codigo.trim(), Number(subtotal));
      setResult(data);
    } catch (error) {
      setResult({
        valido: false,
        mensaje: getApiErrorMessages(error, "No se pudo validar el cupón.")[0],
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
        <Ticket size={18} className="text-cacao-700" />
        Probar un cupón
      </h2>
      <p className="mt-1 text-xs text-stone-500">
        Simula lo que verá el cliente al ingresar el código en el carrito.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value.toUpperCase())}
          required
          maxLength={30}
          aria-label="Código del cupón"
          placeholder="Código, ej. DULCE10"
          className="field-input font-mono sm:flex-1"
        />
        <input
          type="number"
          value={subtotal}
          onChange={(event) => setSubtotal(event.target.value)}
          required
          min="0.01"
          step="0.01"
          aria-label="Subtotal del carrito"
          placeholder="Subtotal (USD)"
          className="field-input sm:w-44"
        />
        <button type="submit" disabled={testing} className="btn-secondary">
          {testing && <LoaderCircle size={16} className="animate-spin" />}
          Validar
        </button>
      </form>

      {result && (
        <div
          role="status"
          className={`mt-4 flex items-start gap-3 rounded-lg border p-3 text-sm ${
            result.valido
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {result.valido ? (
            <CircleCheck size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-semibold">{result.mensaje}</p>
            {result.valido && (
              <p className="mt-1">
                Descuento: {formatCurrency(result.montoDescuento)} · Total a pagar:{" "}
                {formatCurrency(result.totalConDescuento)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};