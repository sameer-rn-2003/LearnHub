import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function RecommendedCard({ title, price }) {
  return (
    <View style={styles.container}>
      <View style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: widthPixel(16),
    padding: widthPixel(12),
    marginBottom: heightPixel(12),
  },
  image: {
    width: widthPixel(70),
    height: heightPixel(70),
    backgroundColor: "#D1D5DB",
    borderRadius: widthPixel(12),
    marginRight: widthPixel(12),
  },
  title: {
    fontSize: heightPixel(14),
    fontWeight: "600",
  },
  price: {
    marginTop: heightPixel(8),
    color: COLORS.price,
    fontWeight: "700",
  },
});
