import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Pressable, StyleSheet, Text } from "react-native";

export default function CategoryChip({ label, active }) {
  return (
    <Pressable
      style={[styles.container, active && { backgroundColor: COLORS.primary }]}
    >
      <Text style={[styles.text, active && { color: COLORS.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(16),
    borderRadius: widthPixel(20),
    backgroundColor: COLORS.chipBg,
    marginRight: widthPixel(10),
  },
  text: {
    fontSize: heightPixel(13),
    fontWeight: "500",
    color: COLORS.primary,
  },
});
