import axios from "axios";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

console.log("apiBaseUrl::", apiBaseUrl);

if (!apiBaseUrl) {
  console.warn("apiBaseUrl is not set. Falling back to placeholder API URL.");
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
