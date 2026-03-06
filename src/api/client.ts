import axios from "axios";
import { router } from "expo-router";
import {
  extractTokenFields,
  getAccessToken,
  getRefreshToken,
  logoutUser,
  saveAccessToken,
  saveRefreshToken,
} from "../store/authTokens";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const baseURL = configuredBaseUrl;
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

  if (normalized === loginPath || normalized === refreshPath) {
    return true;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized);
      return parsed.pathname === loginPath || parsed.pathname === refreshPath;
    } catch {
      return false;
    }
  }

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return (
    withLeadingSlash.startsWith(loginPath) ||
    withLeadingSlash.startsWith(refreshPath)
  );
};

apiClient.interceptors.request.use(
  async (config) => {
    if (isAuthRequest(config.url)) {
      return config;
    }

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

        const refreshUrl = baseURL ? `${baseURL}${refreshPath}` : refreshPath;

        const response = await axios.post(refreshUrl, {
          refreshToken: refreshToken,
        });

        const refreshedTokens = extractTokenFields(response?.data);
        const newAccessToken = refreshedTokens?.accessToken;

        if (!newAccessToken) {
          await handleLogout();
          return Promise.reject(error);
        }

        await saveAccessToken(newAccessToken);
        if (refreshedTokens?.refreshToken) {
          await saveRefreshToken(refreshedTokens.refreshToken);
        }

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
