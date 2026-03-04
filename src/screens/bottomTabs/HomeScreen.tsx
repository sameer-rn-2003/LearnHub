import CategoryChip from "@/src/components/CategoryChip";
import FeaturedCard from "@/src/components/FeaturedCard";
import Header from "@/src/components/Header";
import RecommendedCard from "@/src/components/RecommendedCard";
import SearchBar from "@/src/components/SearchBar";
import SectionHeader from "@/src/components/SectionHeader";
import TrendingCard from "@/src/components/TrendingCard";
import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { useRouter } from "expo-router";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  console.log("Rendering HomeScreen");
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />
      <SearchBar />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CategoryChip label="All" active />
        <CategoryChip label="Design" />
        <CategoryChip label="Tech" />
        <CategoryChip label="Business" />
      </ScrollView>

      <FeaturedCard />

      <SectionHeader title="Trending Courses" />

      <FlatList
        horizontal
        data={[
          { id: 1, title: "Web Dev", price: "$49.99" },
          { id: 2, title: "UI Design", price: "$34.99" },
        ]}
        renderItem={({ item }) => (
          <TrendingCard
            title={item.title}
            price={item.price}
            onPress={() => router.push("/(tabs)/home/courseDetails")}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
      />

      <View style={{ marginTop: heightPixel(20) }}>
        <SectionHeader title="Recommended for You" />
        <RecommendedCard title="Social Media Mastery 2024" price="$19.99" />
        <RecommendedCard title="Python for Data Science" price="$29.99" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(20),
  },
});
