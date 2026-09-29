import { useMemo, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { promotionService } from "../../../services/promotionService";
import { getApiErrorMessages } from "../../../utils/apiError";
import { formatCurrency } from "../../../utils/format";
import { DISCOUNT_TYPES, PROMOTION_TYPES, toDateInput } from "../utils/promotionHelpers";

const NAME_MAX_LENGTH = 100;

const buildInitialForm = (promotion) => ({
  nombre: promotion?.nombre ?? "",
  descripcion: promotion?.descripcion ?? "",
  tipo: promotion?.tipo ?? "Temporada",
  tipoDescuento: promotion?.tipoDescuento ?? "Porcentaje",
  descuento: promotion?.descuento ?? "",
  precioCombo: promotion?.precioCombo ?? "",
  cupon: promotion?.cupon ?? "",
  compraMinima: promotion?.compraMinima ?? "",
  limiteUsos: promotion?.limiteUsos ?? "",
  idCategoria: promotion?.idCategoria ? String(promotion.idCategoria) : "",
  fechaInicio: toDateInput(promotion?.fechaInicio),
  fechaFin: toDateInput(promotion?.fechaFin),
  activa: promotion?.activa ?? true,
  // { [idProducto]: cantidad }
  productos: Object.fromEntries(
    (promotion?.productos ?? []).map((item) => [item.idProducto, item.cantidad]),
  ),
});

const toNumberOrNull = (value) => (value === "" ? null : Number(value));

export const PromotionFormModal = ({ promotion, products, categories, onClose, onSaved }) => {
  const isEdit = Boolean(promotion);
  const [form, setForm] = useState(() => buildInitialForm(promotion));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const usesProducts = form.tipo === "Producto" || form.tipo === "Combo";
  const selectedCount = Object.keys(form.productos).length;

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [products],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleProduct = (productId) => {
    setForm((current) => {
      const productos = { ...current.productos };
      if (productos[productId]) {
        delete productos[productId];
      } else {
        productos[productId] = 1;
      }
      return { ...current, productos };
    });
  };

  const changeQuantity = (productId, value) => {
    setForm((current) => ({
      ...current,
      productos: {
        ...current.productos,
        [productId]: Math.max(1, Number.parseInt(value, 10) || 1),
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      tipo: form.tipo,
      tipoDescuento: form.tipoDescuento,
      descuento: Number(form.descuento || 0),
      precioCombo: form.tipo === "Combo" ? toNumberOrNull(form.precioCombo) : null,
      cupon: form.tipo === "Cupon" ? form.cupon.trim() || null : null,
      compraMinima: toNumberOrNull(form.compraMinima),
      limiteUsos: form.tipo === "Cupon" ? toNumberOrNull(form.limiteUsos) : null,
      idCategoria: form.tipo === "Categoria" ? toNumberOrNull(form.idCategoria) : null,
      fechaInicio: `${form.fechaInicio}T00:00:00`,
      fechaFin: `${form.fechaFin}T00:00:00`,
      activa: form.activa,
      productos: usesProducts
        ? Object.entries(form.productos).map(([idProducto, cantidad]) => ({
            idProducto: Number(idProducto),
            cantidad,
          }))
        : [],
    };

    try {
      if (isEdit) {
        await promotionService.update(promotion.id, payload);
      } else {
        await promotionService.create(payload);
      }
      onSaved(isEdit ? "Promoción actualizada correctamente" : "Promoción creada correctamente");
    } catch (error) {
      setErrors(getApiErrorMessages(error, "No se pudo guardar la promoción."));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar promoción" : "Nueva promoción"}
      description={
        isEdit
          ? "Actualiza la información o el estado de la promoción."
          : "Configura el descuento, su vigencia y a qué productos aplica."
      }
      onClose={onClose}
      dismissible={!saving}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {errors.length > 0 && (
            <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <ul className="space-y-1">
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="nombre" className="field-label">Nombre</label>
              <span className="mb-1.5 text-xs text-stone-400">
                {form.nombre.length}/{NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="nombre" type="text" name="nombre"
              value={form.nombre} onChange={handleChange}
              maxLength={NAME_MAX_LENGTH} required autoFocus
              className="field-input" placeholder="Ej. San Valentín 2027"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="field-label">Descripción</label>
            <textarea
              id="descripcion" name="descripcion" rows="2" maxLength={500}
              value={form.descripcion} onChange={handleChange}
              className="field-input resize-none"
              placeholder="Texto que verá el cliente en la pestaña Ofertas"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tipo" className="field-label">Tipo de promoción</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} className="field-input">
                {PROMOTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tipoDescuento" className="field-label">Tipo de descuento</label>
              <select id="tipoDescuento" name="tipoDescuento" value={form.tipoDescuento} onChange={handleChange} className="field-input">
                {DISCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="descuento" className="field-label">
                {form.tipoDescuento === "Porcentaje" ? "Descuento (%)" : "Descuento (USD)"}
              </label>
              <input
                id="descuento" type="number" name="descuento"
                min="0" max={form.tipoDescuento === "Porcentaje" ? "100" : "10000"} step="0.01"
                value={form.descuento} onChange={handleChange} required
                className="field-input" placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="compraMinima" className="field-label">Compra mínima (opcional)</label>
              <input
                id="compraMinima" type="number" name="compraMinima" min="0" step="0.01"
                value={form.compraMinima} onChange={handleChange}
                className="field-input" placeholder="Sin mínimo"
              />
            </div>
          </div>

          {form.tipo === "Cupon" && (
            <div className="grid gap-4 rounded-lg border border-cacao-200 bg-cacao-50 p-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cupon" className="field-label">Código del cupón</label>
                <input
                  id="cupon" type="text" name="cupon"
                  value={form.cupon}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, cupon: event.target.value.toUpperCase() }))
                  }
                  minLength={4} maxLength={30} required
                  className="field-input font-mono" placeholder="DULCE10"
                />
              </div>
              <div>
                <label htmlFor="limiteUsos" className="field-label">Límite de usos (opcional)</label>
                <input
                  id="limiteUsos" type="number" name="limiteUsos" min="1" step="1"
                  value={form.limiteUsos} onChange={handleChange}
                  className="field-input" placeholder="Ilimitado"
                />
              </div>
            </div>
          )}

          {form.tipo === "Combo" && (
            <div>
              <label htmlFor="precioCombo" className="field-label">Precio del combo (USD)</label>
              <input
                id="precioCombo" type="number" name="precioCombo" min="0.01" step="0.01"
                value={form.precioCombo} onChange={handleChange} required
                className="field-input" placeholder="0.00"
              />
            </div>
          )}

          {form.tipo === "Categoria" && (
            <div>
              <label htmlFor="idCategoria" className="field-label">Categoría</label>
              <select id="idCategoria" name="idCategoria" value={form.idCategoria} onChange={handleChange} required className="field-input">
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>{category.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {usesProducts && (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="field-label">
                  Productos {form.tipo === "Combo" && "(mínimo 2)"}
                </span>
                <span className="mb-1.5 text-xs text-stone-400">{selectedCount} seleccionados</span>
              </div>
              {sortedProducts.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                  No hay productos activos. Crea productos primero.
                </p>
              ) : (
                <ul className="max-h-56 divide-y divide-stone-100 overflow-y-auto rounded-lg border border-stone-200">
                  {sortedProducts.map((product) => {
                    const quantity = form.productos[product.id];
                    const checked = Boolean(quantity);
                    return (
                      <li key={product.id} className="flex items-center gap-3 px-3 py-2.5">
                        <input
                          id={`producto-${product.id}`} type="checkbox"
                          checked={checked} onChange={() => toggleProduct(product.id)}
                          className="h-4 w-4 rounded border-stone-300 accent-cacao-800"
                        />
                        <label htmlFor={`producto-${product.id}`} className="flex-1 text-sm text-stone-700">
                          {product.nombre}
                          <span className="ml-2 text-xs text-stone-400">{formatCurrency(product.precio)}</span>
                        </label>
                        {checked && form.tipo === "Combo" && (
                          <input
                            type="number" min="1" max="100" value={quantity}
                            onChange={(event) => changeQuantity(product.id, event.target.value)}
                            aria-label={`Cantidad de ${product.nombre}`}
                            className="field-input w-20 py-1.5"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fechaInicio" className="field-label">Fecha de inicio</label>
              <input
                id="fechaInicio" type="date" name="fechaInicio"
                value={form.fechaInicio} onChange={handleChange} required className="field-input"
              />
            </div>
            <div>
              <label htmlFor="fechaFin" className="field-label">Fecha de fin</label>
              <input
                id="fechaFin" type="date" name="fechaFin" min={form.fechaInicio || undefined}
                value={form.fechaFin} onChange={handleChange} required className="field-input"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3.5">
            <input
              type="checkbox" name="activa" checked={form.activa} onChange={handleChange}
              className="h-4 w-4 rounded border-stone-300 accent-cacao-800"
            />
            <span>
              <span className="block text-sm font-semibold text-stone-800">Promoción activa</span>
              <span className="block text-xs text-stone-500">
                Si la desactivas, deja de aplicarse aunque esté dentro de sus fechas.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear promoción"}
          </button>
        </div>
      </form>
    </Modal>
  );
};