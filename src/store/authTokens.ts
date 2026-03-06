import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "@learnhub/access_token";
const REFRESH_TOKEN_KEY = "@learnhub/refresh_token";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const getLocalStorage = () => {
  try {
    return (globalThis as any)?.localStorage ?? null;
  } catch {
    return null;
  }
};

const setLocalToken = (key: string, value: string) => {
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return;
  localStorageRef.setItem(key, value);
};

const getLocalToken = (key: string) => {
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return null;
  return localStorageRef.getItem(key);
};

const removeLocalToken = (key: string) => {
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return;
  localStorageRef.removeItem(key);
};

const toTokenString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readTokenFromObject = (
  source: unknown,
  keys: string[],
): string | null => {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const token = toTokenString(record[key]);
    if (token) return token;
  }
  return null;
};

export const extractTokenFields = (
  payload: unknown,
): Partial<AuthTokens> | null => {
  const candidates = [
    payload,
    (payload as any)?.data,
    (payload as any)?.data?.data,
    (payload as any)?.result,
    (payload as any)?.result?.data,
  ];

  for (const candidate of candidates) {
    const accessToken = readTokenFromObject(candidate, [
      "accessToken",
      "access_token",
      "token",
      "jwt",
      "access",
    ]);
    const refreshToken = readTokenFromObject(candidate, [
      "refreshToken",
      "refresh_token",
      "refresh",
    ]);

    if (accessToken || refreshToken) {
      return {
        ...(accessToken ? { accessToken } : {}),
        ...(refreshToken ? { refreshToken } : {}),
      };
    }
  }

  return null;
};

export const setAuthTokens = async (tokens: AuthTokens) => {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
  ]);

  setLocalToken(ACCESS_TOKEN_KEY, tokens.accessToken);
  setLocalToken(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const saveAccessToken = async (accessToken: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  setLocalToken(ACCESS_TOKEN_KEY, accessToken);
};

export const saveRefreshToken = async (refreshToken: string) => {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setLocalToken(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = async () => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return token || getLocalToken(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  return token || getLocalToken(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  removeLocalToken(ACCESS_TOKEN_KEY);
  removeLocalToken(REFRESH_TOKEN_KEY);
};

const clearAllLocalStorage = async () => {
  await AsyncStorage.clear();
  const localStorageRef = getLocalStorage();
  if (!localStorageRef) return;
  localStorageRef.clear();
};

export const logoutUser = async () => {
  await clearAllLocalStorage();
};
