import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStatus } from "@/src/hooks/useAuthStatus";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function TabsLayout() {
  const { isLoading, hasToken } = useAuthStatus();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!hasToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: colors.tabBarBorder,
          backgroundColor: colors.tabBarBg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size }) => {
          const iconName: keyof typeof Ionicons.glyphMap =
            route.name === "home"
              ? "home"
              : route.name === "search"
                ? "search"
                : route.name === "myCourses"
                  ? "book"
                  : "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="myCourses" options={{ title: "My Courses" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="bookmarks" options={{ href: null }} />
    </Tabs>
  );
}
