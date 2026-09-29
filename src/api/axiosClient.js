import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7076/api";

const AUTH_PATHS = ["/auth/login", "/auth/logout", "/auth/manage/info"];

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthRequest = AUTH_PATHS.some((path) => url.startsWith(path));

    if (status === 401 && !isAuthRequest && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  },
);
