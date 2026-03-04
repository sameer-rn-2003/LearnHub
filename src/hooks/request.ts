import { apiClient } from "../api/client";

export type LoginPayload = {
  username: string;
  password: string;
};

export const LoginApi = async (body: LoginPayload) => {
  return apiClient.post("/users/login", body);
};
