import {
  getAccessToken,
  getRefreshToken,
  logoutUser,
  saveAccessToken,
} from "@/src/store/authTokens";
import axios from "axios";
import { router } from "expo-router";

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim();
const loginPath = "/api/auth/login";
const refreshPath = "/api/auth/refresh-token";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleLogout = async () => {
  await logoutUser();
  try {
    router.replace("/(auth)/login");
  } catch {}
};

const isAuthRequest = (url?: string) => {
  if (!url) return false;
  const normalized = url.toLowerCase().trim();
  return (
    normalized.includes(loginPath) || normalized.includes(refreshPath)
  );
};

apiClient.interceptors.request.use(
  async (config) => {
    if (isAuthRequest(config.url)) {
      return config;
    }

    const token = await getAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (isAuthRequest(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await handleLogout();
          return Promise.reject(error);
        }

        const refreshUrl = baseURL ? `${baseURL}${refreshPath}` : refreshPath;
        const response = await axios.post(refreshUrl, {
          refreshToken,
        });

        const newAccessToken = response.data?.accessToken;

        if (!newAccessToken) {
          await handleLogout();
          return Promise.reject(error);
        }

        await saveAccessToken(newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
