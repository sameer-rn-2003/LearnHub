import { BookmarkedCourse, useBookmarks } from "@/src/store/bookmarks";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

export default function BookmarksScreen() {
  const router = useRouter();
  const { bookmarkedCourses, toggleBookmark } = useBookmarks();

  const openProductDetails = (course: BookmarkedCourse) => {
    router.push({
      pathname: "/(tabs)/home/courseDetails",
      params: { productData: encodeURIComponent(JSON.stringify(course)) },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Bookmarked Courses</Text>
        <Text style={styles.pageSubtitle}>{bookmarkedCourses.length} saved</Text>

        {bookmarkedCourses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={heightPixel(28)} color="#6C7C95" />
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptyDesc}>
              Save courses from Home or Search to keep them here.
            </Text>
          </View>
        )}

        {bookmarkedCourses.map((course) => (
          <Pressable
            key={course.id}
            style={styles.courseCard}
            onPress={() => openProductDetails(course)}
          >
            <Image
              source={{ uri: course.images?.[0] || FALLBACK_IMAGE }}
              style={styles.courseImage}
            />

            <View style={styles.courseBody}>
              <View style={styles.courseTopRow}>
                <Text numberOfLines={1} style={styles.courseTitle}>
                  {course.name}
                </Text>
                <Pressable
                  onPress={(event) => {
                    event?.stopPropagation?.();
                    toggleBookmark(course);
                  }}
                  style={styles.bookmarkButton}
                >
                  <Ionicons name="bookmark" size={heightPixel(16)} color="#0A2342" />
                </Pressable>
              </View>

              <Text numberOfLines={2} style={styles.courseDescription}>
                {course.description}
              </Text>
              <Text style={styles.courseAuthor}>By {course.author_name}</Text>
              <Text style={styles.coursePrice}>{formatPrice(course.price)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(24),
    paddingBottom: heightPixel(32),
  },
  pageTitle: {
    color: "#122845",
    fontSize: heightPixel(25),
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: heightPixel(4),
    marginBottom: heightPixel(16),
    color: "#6C7C95",
    fontSize: heightPixel(13),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: widthPixel(16),
    borderWidth: 1,
    borderColor: "#E0E7F2",
    backgroundColor: "#FFFFFF",
    paddingVertical: heightPixel(28),
    paddingHorizontal: widthPixel(20),
  },
  emptyTitle: {
    marginTop: heightPixel(8),
    color: "#122845",
    fontSize: heightPixel(15),
    fontWeight: "700",
  },
  emptyDesc: {
    marginTop: heightPixel(4),
    textAlign: "center",
    color: "#6C7C95",
    fontSize: heightPixel(12),
    lineHeight: heightPixel(18),
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: widthPixel(16),
    borderWidth: 1,
    borderColor: "#E0E7F2",
    padding: widthPixel(10),
    marginBottom: heightPixel(12),
  },
  courseImage: {
    width: widthPixel(96),
    height: heightPixel(96),
    borderRadius: widthPixel(12),
    marginRight: widthPixel(10),
  },
  courseBody: {
    flex: 1,
  },
  courseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: widthPixel(8),
  },
  courseTitle: {
    flex: 1,
    color: "#132843",
    fontSize: heightPixel(13),
    fontWeight: "700",
  },
  bookmarkButton: {
    width: widthPixel(28),
    height: heightPixel(28),
    borderRadius: widthPixel(14),
    backgroundColor: "#EEF3FA",
    alignItems: "center",
    justifyContent: "center",
  },
  courseDescription: {
    marginTop: heightPixel(5),
    color: "#66758C",
    fontSize: heightPixel(11),
    lineHeight: heightPixel(16),
  },
  courseAuthor: {
    marginTop: heightPixel(5),
    color: "#30445F",
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  coursePrice: {
    marginTop: heightPixel(4),
    color: "#0A2342",
    fontSize: heightPixel(12),
    fontWeight: "800",
  },
});
