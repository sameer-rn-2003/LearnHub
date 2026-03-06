import { useAppTheme } from "@/src/theme/useAppTheme";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: widthPixel(8),
        }}
      >
        <View
          style={{
            height: heightPixel(34),
            width: widthPixel(34),
            backgroundColor: colors.accentStrong,
            borderRadius: widthPixel(12),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={require("../../assets/images/Logo.png")} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>LearnHub</Text>
      </View>
      <Ionicons
        name="notifications-outline"
        size={heightPixel(22)}
        color={colors.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPixel(14),
  },
  title: {
    fontSize: heightPixel(20),
    fontWeight: "700",
  },
});
