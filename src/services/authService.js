import { axiosClient } from "../api/axiosClient";

export const authService = {
  login: async (email, password, remember = true) => {
    const params = remember ? { useCookies: true } : { useSessionCookies: true };
    await axiosClient.post("/auth/login", { email, password }, { params });
  },

  logout: async () => {
    await axiosClient.post("/auth/logout");
  },

  getSession: async () => {
    const response = await axiosClient.get("/auth/manage/info");
    return response.data;
  },
};
