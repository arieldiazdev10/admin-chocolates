import { axiosClient } from "../api/axiosClient";

export const dashboardService = {
  getSummary: async () => {
    const response = await axiosClient.get("/admin/dashboard/summary");
    return response.data;
  },

  // params: { top, desde, hasta } (todos opcionales)
  getTopProducts: async (params = {}) => {
    const response = await axiosClient.get("/admin/dashboard/top-products", {
      params,
    });
    return response.data;
  },
};