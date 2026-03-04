import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FeaturedCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.tag}>FEATURED COURSE</Text>
      <Text style={styles.title}>Master Digital Illustration 2024</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Enroll Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: heightPixel(170),
    borderRadius: widthPixel(24),
    backgroundColor: COLORS.primary,
    padding: widthPixel(20),
    marginVertical: heightPixel(16),
  },
  tag: {
    color: "#C7D2FE",
    fontSize: heightPixel(11),
    marginBottom: heightPixel(8),
  },
  title: {
    fontSize: heightPixel(20),
    fontWeight: "700",
    color: COLORS.white,
  },
  button: {
    marginTop: heightPixel(16),
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
    paddingHorizontal: widthPixel(18),
    paddingVertical: heightPixel(8),
    borderRadius: widthPixel(16),
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
