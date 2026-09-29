import { axiosClient } from "../api/axiosClient";

export const promotionService = {
  // Endpoints públicos
  getActive: async () => {
    const response = await axiosClient.get("/promotions/active");
    return response.data;
  },

  // La API responde 400 cuando el cupón no es válido, pero con el mismo
  // formato; aquí se devuelve la respuesta en ambos casos.
  validateCoupon: async (codigo, subtotal) => {
    try {
      const response = await axiosClient.post("/promotions/validate-coupon", {
        codigo,
        subtotal,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.mensaje) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Endpoints administrativos
  getAll: async () => {
    const response = await axiosClient.get("/admin/promotions");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/admin/promotions/${id}`);
    return response.data;
  },

  create: async (promotionData) => {
    const response = await axiosClient.post("/admin/promotions", promotionData);
    return response.data;
  },

  update: async (id, promotionData) => {
    const response = await axiosClient.put(`/admin/promotions/${id}`, promotionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/admin/promotions/${id}`);
    return response.data;
  },
};