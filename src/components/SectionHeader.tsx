import { COLORS } from "@/src/constants/colors";
import { heightPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function SectionHeader({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.seeAll}>See All</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: heightPixel(12),
  },
  title: {
    fontSize: heightPixel(16),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: heightPixel(13),
    color: COLORS.primary,
  },
});
