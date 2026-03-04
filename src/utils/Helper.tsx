import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const widthScale = SCREEN_WIDTH / guidelineBaseWidth;
const heightScale = SCREEN_HEIGHT / guidelineBaseHeight;

const normalize = (size: number, based: "width" | "height" = "height") => {
  const newSize = based === "height" ? size * heightScale : size * widthScale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const widthPixel = (size: number) => normalize(size, "width");
export const heightPixel = (size: number) => normalize(size, "height");

export const isValidEmail = (email: string) => {
  const value = email.trim();
  if (!value) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address";
  return "";
};

export const isValidPassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Minimum 8 characters required";
  return "";
};

export const capitalizeFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const trimValue = (value: string) => value.trim();

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
