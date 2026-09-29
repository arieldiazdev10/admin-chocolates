import { axiosClient } from "../api/axiosClient";

export const categoryService = {
  getAll: async () => {
    const response = await axiosClient.get("/categories");
    return response.data;
  },
};
