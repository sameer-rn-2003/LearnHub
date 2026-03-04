import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
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
            backgroundColor: COLORS.primary,
            borderRadius: widthPixel(12),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={require("../../assets/images/Logo.png")} />
        </View>
        <Text style={styles.title}>LearnHub</Text>
      </View>
      <Ionicons
        name="notifications-outline"
        size={heightPixel(22)}
        color={COLORS.textPrimary}
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
    color: COLORS.textPrimary,
  },
});
