import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BottomEnrollBar() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.total}>TOTAL PRICE</Text>
        <Text style={styles.price}>$89.99</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Enroll Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: widthPixel(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  total: {
    fontSize: heightPixel(11),
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: heightPixel(18),
    fontWeight: "700",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: heightPixel(12),
    paddingHorizontal: widthPixel(24),
    borderRadius: widthPixel(20),
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
