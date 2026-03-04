import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TrendingCard({ title, price, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress()} style={styles.container}>
      <View style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: widthPixel(150),
    backgroundColor: COLORS.white,
    borderRadius: widthPixel(16),
    padding: widthPixel(10),
    marginRight: widthPixel(12),
  },
  image: {
    height: heightPixel(90),
    backgroundColor: "#D1D5DB",
    borderRadius: widthPixel(12),
    marginBottom: heightPixel(8),
  },
  title: {
    fontSize: heightPixel(13),
    fontWeight: "600",
  },
  price: {
    marginTop: heightPixel(6),
    color: COLORS.price,
    fontWeight: "700",
  },
});
