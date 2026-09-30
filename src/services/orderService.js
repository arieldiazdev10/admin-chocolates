import { axiosClient } from "../api/axiosClient";

export const orderService = {
  getAll: async ({ estado, fechaDesde, fechaHasta } = {}) => {
    const params = {};
    if (estado) params.estado = estado;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await axiosClient.get("/admin/orders", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, estado) => {
    const response = await axiosClient.patch(`/admin/orders/${id}/status`, {
      estado,
    });
    return response.data;
  },
};
