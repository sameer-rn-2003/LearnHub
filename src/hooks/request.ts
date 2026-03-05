import { apiClient } from "../api/client";

export type LoginPayload = {
  email: string;
  password: string;
};

export const LoginApi = async (body: LoginPayload) => {
  return apiClient.post("api/auth/login", body);
};

export type ProductCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductWithCategories = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
};

export type ProductsWithCategoriesResponse = {
  message: string;
  data: ProductWithCategories[];
};

export const getProductsWithCategoriesApi = async () => {
  return apiClient.get<ProductsWithCategoriesResponse>(
    "api/products/with-categories",
  );
};
