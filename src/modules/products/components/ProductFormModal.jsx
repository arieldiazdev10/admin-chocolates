import { useMemo, useState } from "react";
import { CircleAlert, ImageOff, LoaderCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { productService } from "../../../services/productService";
import { getApiErrorMessages } from "../../../utils/apiError";

const NAME_MAX_LENGTH = 50;

const buildInitialForm = (product) => ({
  nombre: product?.nombre ?? "",
  descripcion: product?.descripcion ?? "",
  precio: product?.precio ?? "",
  stock: product?.stock ?? "",
  idCategoria: product?.idCategoria ? String(product.idCategoria) : "",
  imagenUrl: product?.imagenUrl ?? "",
  esDestacado: product?.esDestacado ?? false,
});

const ImagePreview = ({ url }) => {
  const [failed, setFailed] = useState(false);

  if (!url) {
    return null;
  }

  if (failed) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-rose-600">
        <ImageOff size={14} /> No se pudo cargar la imagen con esa URL.
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Vista previa"
      onError={() => setFailed(true)}
      className="mt-2 h-28 w-28 rounded-lg border border-stone-200 object-cover"
    />
  );
};

export const ProductFormModal = ({ product, categories, onClose, onSaved }) => {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() => buildInitialForm(product));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [categories],
  );

  const categoryMissing =
    isEdit &&
    product.idCategoria &&
    !categories.some((category) => category.id === product.idCategoria);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      idCategoria: Number(form.idCategoria),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number.parseInt(form.stock, 10),
      imagenUrl: form.imagenUrl.trim() || null,
      esDestacado: form.esDestacado,
    };

    try {
      if (isEdit) {
        await productService.update(product.id, payload);
      } else {
        await productService.create(payload);
      }
      onSaved(isEdit ? "Producto actualizado correctamente" : "Producto creado correctamente");
    } catch (error) {
      setErrors(getApiErrorMessages(error, "No se pudo guardar el producto."));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar producto" : "Nuevo producto"}
      description={
        isEdit
          ? "Actualiza la información del producto seleccionado."
          : "Completa los datos para agregar un producto al catálogo."
      }
      onClose={onClose}
      dismissible={!saving}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {errors.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
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
              <label htmlFor="nombre" className="field-label">
                Nombre
              </label>
              <span className="mb-1.5 text-xs text-stone-400">
                {form.nombre.length}/{NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              maxLength={NAME_MAX_LENGTH}
              required
              autoFocus
              className="field-input"
              placeholder="Ej. Chocolate amargo 70%"
            />
          </div>

          <div>
            <label htmlFor="idCategoria" className="field-label">
              Categoría
            </label>
            <select
              id="idCategoria"
              name="idCategoria"
              value={form.idCategoria}
              onChange={handleChange}
              required
              className="field-input"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categoryMissing && (
                <option value={String(product.idCategoria)}>
                  Categoría #{product.idCategoria} (no disponible)
                </option>
              )}
              {sortedCategories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.nombre}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700">
                No hay categorías disponibles. Verifica la conexión con la API.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="precio" className="field-label">
                Precio (USD)
              </label>
              <input
                id="precio"
                type="number"
                name="precio"
                min="0.01"
                max="999999.99"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="stock" className="field-label">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="descripcion" className="field-label">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              value={form.descripcion}
              onChange={handleChange}
              required
              className="field-input resize-none"
              placeholder="Describe sabor, ingredientes o presentación"
            />
          </div>

          <div>
            <label htmlFor="imagenUrl" className="field-label">
              URL de la imagen
            </label>
            <input
              id="imagenUrl"
              type="text"
              name="imagenUrl"
              value={form.imagenUrl}
              onChange={handleChange}
              className="field-input"
              placeholder="https://..."
            />
            <ImagePreview key={form.imagenUrl} url={form.imagenUrl.trim()} />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3.5">
            <input
              type="checkbox"
              name="esDestacado"
              checked={form.esDestacado}
              onChange={handleChange}
              className="h-4 w-4 rounded border-stone-300 accent-cacao-800"
            />
            <span>
              <span className="block text-sm font-semibold text-stone-800">
                Producto destacado
              </span>
              <span className="block text-xs text-stone-500">
                Se mostrará en la sección de destacados de la tienda.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
