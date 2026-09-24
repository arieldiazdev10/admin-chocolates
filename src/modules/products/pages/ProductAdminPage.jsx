import React, { useEffect, useState } from "react";
import { productService } from "../../../services/productService";
import { Plus, Edit, Trash2, Package, X, Star } from "lucide-react";

const initialFormState = {
  nombre: "",
  descripcion: "",
  precio: "",
  existencias: "",
  categoriaID: "",
  urlImagen: "",
  destacado: false,
  usuarioCreacionID: 1, // Puedes ajustarlo según tu sistema de sesión actual
  usuarioModificacionID: 1,
};

export const ProductAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Error al conectar con la API de productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        idCategoria: product.categoriaID,
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio || "",
        imagenUrl: product.urlImagen || "",
        esDestacado: product.destacado || 0,
        stock: product.existencias || "",
      });
    } else {
      setCurrentProduct(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir valores numéricos adecuadamente
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.existencias, 10),
        idCategoria: parseInt(formData.categoriaID, 10),
      };

      if (currentProduct) {
        // Actualizar (PUT /api/admin/products/{id})
        await productService.update(currentProduct.productoID, payload);
      } else {
        // Crear (POST /api/admin/products)
        await productService.create(payload);
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      alert("Hubo un error al guardar el producto.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de realizar el borrado lógico de este producto?",
      )
    ) {
      try {
        await productService.delete(id); // DELETE /api/admin/products/{id} (Soft Delete)
        setProducts(products.filter((p) => p.productoID !== id));
      } catch (err) {
        alert("No se pudo eliminar el producto.");
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-amber-700" /> Administración de
              Chocolates
            </h1>
            <p className="text-sm text-gray-500">
              Gestión de inventario y catálogo activo.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Cargando productos...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Nombre</th>
                    <th className="py-4 px-6">Categoría</th>
                    <th className="py-4 px-6">Precio</th>
                    <th className="py-4 px-6">Existencias</th>
                    <th className="py-4 px-6 text-center">Destacado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        #{product.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                        {product.imagenUrl && (
                          <img
                            src={product.imagenUrl}
                            alt={product.nombre}
                            className="w-10 h-10 object-cover rounded-md border"
                          />
                        )}
                        {product.nombre}
                      </td>
                      <td className="py-4 px-6">Cat. {product.idCategoria}</td>
                      <td className="py-4 px-6">
                        ${product.precio?.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            (product.stock ?? 0) > 5
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {product.stock} unids.
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        {product.esDestacado == 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Star
                              size={14}
                              className="fill-amber-500 text-amber-500"
                            />{" "}
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center flex justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-400"
                      >
                        No hay productos activos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {currentProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Existencias
                  </label>
                  <input
                    type="number"
                    name="existencias"
                    value={formData.existencias}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    ID Categoría
                  </label>
                  <input
                    type="number"
                    name="categoriaID"
                    value={formData.categoriaID}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={formData.destacado}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-800 rounded focus:ring-amber-700"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      ¿Producto Destacado?
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  URL de la Imagen
                </label>
                <input
                  type="text"
                  name="urlImagen"
                  value={formData.urlImagen}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
