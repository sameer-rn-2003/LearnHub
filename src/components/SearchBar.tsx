import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#9CA3AF" />
      <TextInput
        placeholder="Search for skills, software, or tutorials..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: heightPixel(48),
    backgroundColor: "#F1F5F9",
    borderRadius: widthPixel(16),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: widthPixel(14),
    marginBottom: heightPixel(12),
  },
  input: {
    flex: 1,
    marginLeft: widthPixel(10),
  },
});
