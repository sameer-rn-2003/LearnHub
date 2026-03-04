import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function CourseHeader() {
  return (
    <View style={styles.container}>
      <Ionicons name="arrow-back" size={22} />
      <Text style={styles.title}>Course Details</Text>
      <View style={styles.right}>
        <Ionicons name="share-outline" size={20} />
        <Ionicons name="heart-outline" size={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: heightPixel(16),
  },
  title: {
    fontSize: heightPixel(16),
    fontWeight: "600",
  },
  right: {
    flexDirection: "row",
    gap: widthPixel(14),
  },
});
