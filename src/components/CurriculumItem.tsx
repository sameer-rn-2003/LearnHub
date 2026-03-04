import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function CurriculumItem({ title, locked }) {
  return (
    <View style={styles.container}>
      <Text style={styles.index}>01</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>45 mins • Video</Text>
      </View>
      {locked && <Text>🔒</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: widthPixel(14),
    padding: widthPixel(14),
    alignItems: "center",
    marginBottom: heightPixel(12),
  },
  index: {
    fontWeight: "700",
    marginRight: widthPixel(14),
  },
  title: {
    fontSize: heightPixel(13),
    fontWeight: "600",
  },
  time: {
    fontSize: heightPixel(11),
    color: COLORS.textSecondary,
  },
});
