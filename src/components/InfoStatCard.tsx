import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function InfoStatCard({ label, value }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: widthPixel(16),
    padding: widthPixel(14),
    marginRight: widthPixel(10),
  },
  label: {
    fontSize: heightPixel(11),
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: heightPixel(14),
    fontWeight: "600",
    marginTop: heightPixel(6),
  },
});
