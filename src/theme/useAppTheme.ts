import { useColorScheme } from "@/hooks/use-color-scheme";

export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  danger: string;
  warningBg: string;
  warningText: string;
  success: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  overlayTop: string;
  overlayBottom: string;
  icon: string;
};

const lightColors: AppThemeColors = {
  background: "#F1F5FF",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF3FF",
  border: "#DCE6F8",
  textPrimary: "#11213D",
  textSecondary: "#5F7190",
  textMuted: "#8A9AB5",
  accent: "#2D5BCE",
  accentStrong: "#163F99",
  accentSoft: "#E8EEFF",
  danger: "#C12C43",
  warningBg: "#EDF4FF",
  warningText: "#1E3D7F",
  success: "#1F8E54",
  inputBg: "#F4F7FD",
  inputBorder: "#D9E2F3",
  tabBarBg: "#F7FAFF",
  tabBarBorder: "#D9E2F3",
  overlayTop: "rgba(45, 91, 206, 0.12)",
  overlayBottom: "rgba(12, 163, 154, 0.13)",
  icon: "#4E6387",
};

const darkColors: AppThemeColors = {
  background: "#060B16",
  surface: "#0E1628",
  surfaceAlt: "#121E36",
  border: "#213152",
  textPrimary: "#EAF0FF",
  textSecondary: "#A8B8D9",
  textMuted: "#7E90B6",
  accent: "#7FA8FF",
  accentStrong: "#4F79E0",
  accentSoft: "#1B2B4A",
  danger: "#FF758A",
  warningBg: "#182642",
  warningText: "#BBD3FF",
  success: "#4DD08A",
  inputBg: "#121E36",
  inputBorder: "#273B61",
  tabBarBg: "#0A1120",
  tabBarBorder: "#1D2B49",
  overlayTop: "rgba(95, 136, 219, 0.24)",
  overlayBottom: "rgba(11, 121, 143, 0.24)",
  icon: "#9DB0DB",
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
};
