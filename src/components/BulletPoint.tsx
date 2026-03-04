import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { StyleSheet, Text, View } from "react-native";

export default function BulletPoint({ text }) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: heightPixel(10),
  },
  dot: {
    width: widthPixel(6),
    height: heightPixel(6),
    borderRadius: 6,
    backgroundColor: "#4F46E5",
    marginTop: heightPixel(6),
    marginRight: widthPixel(10),
  },
  text: {
    flex: 1,
    fontSize: heightPixel(13),
  },
});
