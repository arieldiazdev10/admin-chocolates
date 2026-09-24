import { axiosClient } from "../api/axiosClient";

export const productService = {
  // Endpoints públicos (GET)
  getAll: async () => {
    const response = await axiosClient.get("/products");
    return response.data;
  },

  getFeatured: async () => {
    const response = await axiosClient.get("/products/featured");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  },

  // Endpoints administrativos (POST, PUT, DELETE - Soft Delete)
  create: async (productData) => {
    const response = await axiosClient.post("/admin/products", productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await axiosClient.put(
      `/admin/products/${id}`,
      productData,
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/admin/products/${id}`);
    return response.data;
  },
};
