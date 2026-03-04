import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function InstructorInfo() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <View>
        <Text style={styles.name}>Jane Cooper</Text>
        <Text style={styles.role}>Senior Product Designer at TechFlow</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: heightPixel(16),
  },
  avatar: {
    width: widthPixel(40),
    height: heightPixel(40),
    borderRadius: widthPixel(20),
    backgroundColor: "#D1D5DB",
    marginRight: widthPixel(12),
  },
  name: {
    fontSize: heightPixel(14),
    fontWeight: "600",
  },
  role: {
    fontSize: heightPixel(12),
    color: COLORS.textSecondary,
  },
});
