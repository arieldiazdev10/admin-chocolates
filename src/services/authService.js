import { axiosClient } from "../api/axiosClient";

export const authService = {
  login: async (email, password) => {
    const response = await axiosClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },
};
