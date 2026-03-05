import { useAuthStatus } from "@/src/hooks/useAuthStatus";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function OnboardLayout() {
  const { isLoading, hasToken } = useAuthStatus();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasToken) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
