import axios from "axios";
import { router } from "expo-router";
import {
  getAccessToken,
  getRefreshToken,
  logoutUser,
  saveAccessToken,
} from "../store/authTokens";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const baseURL = configuredBaseUrl;
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
  const normalized = url.toLowerCase();
  return (
    normalized.includes("/api/auth/login") ||
    normalized.includes(refreshPath.toLowerCase())
  );
};

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await handleLogout();
          return Promise.reject(error);
        }

        const response = await axios.post(`${baseURL}${refreshPath}`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = response?.data?.accessToken;

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
