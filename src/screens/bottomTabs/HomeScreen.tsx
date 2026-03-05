import Header from "@/src/components/Header";
import {
  getProductsWithCategoriesApi,
  ProductWithCategories,
} from "@/src/hooks/request";
import { useBookmarks } from "@/src/store/bookmarks";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getProductsWithCategoriesApi();
      setProducts(response?.data?.data ?? []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to fetch products. Please try again.";
      setErrorMessage(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const categoryLabels = useMemo(() => {
    const categories = new Set<string>(["All"]);

    products.forEach((course) => {
      course.categories?.forEach((category) => {
        categories.add(category.name);
      });
    });

    return Array.from(categories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((course) => {
      const matchesCategory =
        selectedCategory === "All" ||
        course.categories?.some(
          (category) => category.name === selectedCategory,
        );

      const matchesSearch =
        !normalizedQuery ||
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.author_name.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const featuredCourse = filteredProducts[0] ?? null;
  const trendingCourses = filteredProducts.slice(0, 5);

  const handleToggleBookmark = useCallback(
    (course: ProductWithCategories) => {
      toggleBookmark(course);
    },
    [toggleBookmark],
  );

  const openProductDetails = useCallback(
    (course: ProductWithCategories) => {
      router.push({
        pathname: "/(tabs)/home/courseDetails",
        params: { productData: encodeURIComponent(JSON.stringify(course)) },
      });
    },
    [router],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.bgShapeTop} />
      <View style={styles.bgShapeBottom} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        {/* <View style={styles.searchContainer}>
          <Ionicons name="search" size={heightPixel(18)} color="#8A98AE" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search course or author"
            placeholderTextColor="#8A98AE"
            style={styles.searchInput}
          />
        </View> */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categoryLabels.map((label) => {
            const active = label === selectedCategory;
            return (
              <Pressable
                key={label}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(label)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading && (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color="#0A2342" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        )}

        {!loading && !!errorMessage && (
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.retryButton} onPress={fetchProducts}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && !errorMessage && (
          <>
            {featuredCourse && (
              <ImageBackground
                source={{ uri: featuredCourse.images?.[0] || FALLBACK_IMAGE }}
                style={styles.featuredCard}
                imageStyle={styles.featuredImage}
              >
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredTopRow}>
                    <Text style={styles.featuredBadge}>FEATURED COURSE</Text>
                    <Pressable
                      onPress={(event) => {
                        event?.stopPropagation?.();
                        handleToggleBookmark(featuredCourse);
                      }}
                      style={styles.featuredBookmarkButton}
                    >
                      <Ionicons
                        name={
                          bookmarkedIds.has(featuredCourse.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={heightPixel(18)}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.featuredTitle}>
                    {featuredCourse.name}
                  </Text>
                  <Text style={styles.featuredSubtitle}>
                    by {featuredCourse.author_name}
                  </Text>
                  <Text style={styles.featuredPrice}>
                    {formatPrice(featuredCourse.price)}
                  </Text>
                </View>
              </ImageBackground>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Right Now</Text>
              <Text style={styles.sectionMeta}>
                {trendingCourses.length} items
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trendingCourses.map((course) => (
                <Pressable
                  key={course.id}
                  style={styles.trendingCard}
                  onPress={() => openProductDetails(course)}
                >
                  <Pressable
                    onPress={(event) => {
                      event?.stopPropagation?.();
                      handleToggleBookmark(course);
                    }}
                    style={styles.trendingBookmarkButton}
                  >
                    <Ionicons
                      name={
                        bookmarkedIds.has(course.id)
                          ? "bookmark"
                          : "bookmark-outline"
                      }
                      size={heightPixel(16)}
                      color={
                        bookmarkedIds.has(course.id) ? "#0A2342" : "#4B5D79"
                      }
                    />
                  </Pressable>
                  <Image
                    source={{ uri: course.images?.[0] || FALLBACK_IMAGE }}
                    style={styles.trendingImage}
                  />
                  <Text numberOfLines={2} style={styles.trendingTitle}>
                    {course.name}
                  </Text>
                  <Text style={styles.trendingAuthor}>
                    {course.author_name}
                  </Text>
                  <Text style={styles.trendingPrice}>
                    {formatPrice(course.price)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Courses</Text>
              <Text style={styles.sectionMeta}>
                {filteredProducts.length} results
              </Text>
            </View>

            {filteredProducts.length === 0 && (
              <View style={styles.stateCard}>
                <Text style={styles.stateText}>
                  No courses found for current filters.
                </Text>
              </View>
            )}

            {filteredProducts.map((course) => (
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
                        handleToggleBookmark(course);
                      }}
                      style={styles.courseBookmarkButton}
                    >
                      <Ionicons
                        name={
                          bookmarkedIds.has(course.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={heightPixel(16)}
                        color={
                          bookmarkedIds.has(course.id) ? "#0A2342" : "#4B5D79"
                        }
                      />
                    </Pressable>
                  </View>
                  <Text numberOfLines={2} style={styles.courseDescription}>
                    {course.description}
                  </Text>
                  <Text style={styles.coursePrice}>
                    {formatPrice(course.price)}
                  </Text>
                  <Text style={styles.courseAuthor}>
                    By {course.author_name}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.courseCategoryRow}>
                      {course.categories?.map((category) => (
                        <View key={category.id} style={styles.inlineCategory}>
                          <Text style={styles.inlineCategoryText}>
                            {category.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F6FF",
  },
  bgShapeTop: {
    position: "absolute",
    top: -heightPixel(70),
    right: -widthPixel(70),
    width: widthPixel(220),
    height: heightPixel(220),
    borderRadius: widthPixel(110),
    backgroundColor: "rgba(10, 35, 66, 0.08)",
  },
  bgShapeBottom: {
    position: "absolute",
    bottom: -heightPixel(90),
    left: -widthPixel(40),
    width: widthPixel(180),
    height: heightPixel(180),
    borderRadius: widthPixel(90),
    backgroundColor: "rgba(212, 169, 79, 0.12)",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(36),
  },
  searchContainer: {
    height: heightPixel(50),
    borderRadius: widthPixel(16),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7F2",
    paddingHorizontal: widthPixel(14),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPixel(14),
  },
  searchInput: {
    flex: 1,
    marginLeft: widthPixel(10),
    color: "#10233F",
    fontSize: heightPixel(13),
  },
  categoryRow: {
    paddingBottom: heightPixel(4),
  },
  categoryChip: {
    marginRight: widthPixel(10),
    borderRadius: widthPixel(999),
    borderWidth: 1,
    borderColor: "#D6DEEA",
    backgroundColor: "#FFFFFF",
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(16),
  },
  categoryChipActive: {
    backgroundColor: "#0A2342",
    borderColor: "#0A2342",
  },
  categoryText: {
    color: "#3B4B63",
    fontSize: heightPixel(12),
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  stateCard: {
    marginTop: heightPixel(16),
    backgroundColor: "#FFFFFF",
    borderRadius: widthPixel(16),
    borderWidth: 1,
    borderColor: "#E0E7F2",
    padding: widthPixel(16),
    alignItems: "center",
    justifyContent: "center",
    gap: heightPixel(10),
  },
  stateText: {
    color: "#3B4B63",
    fontSize: heightPixel(13),
    fontWeight: "500",
  },
  errorText: {
    color: "#B42318",
    fontSize: heightPixel(13),
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0A2342",
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(14),
    borderRadius: widthPixel(10),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuredCard: {
    height: heightPixel(190),
    marginTop: heightPixel(16),
    marginBottom: heightPixel(18),
    borderRadius: widthPixel(24),
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  featuredImage: {
    borderRadius: widthPixel(24),
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 14, 28, 0.58)",
  },
  featuredContent: {
    padding: widthPixel(18),
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredBadge: {
    color: "#F8E3B0",
    fontSize: heightPixel(11),
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  featuredBookmarkButton: {
    width: widthPixel(34),
    height: heightPixel(34),
    borderRadius: widthPixel(17),
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: heightPixel(19),
    fontWeight: "800",
    marginTop: heightPixel(6),
  },
  featuredSubtitle: {
    color: "#D5DFEC",
    fontSize: heightPixel(12),
    marginTop: heightPixel(3),
  },
  featuredPrice: {
    marginTop: heightPixel(8),
    color: "#F8E3B0",
    fontSize: heightPixel(15),
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: heightPixel(6),
    marginBottom: heightPixel(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#10233F",
    fontSize: heightPixel(17),
    fontWeight: "800",
  },
  sectionMeta: {
    color: "#6C7C95",
    fontSize: heightPixel(12),
    fontWeight: "600",
  },
  trendingCard: {
    width: widthPixel(180),
    marginRight: widthPixel(12),
    borderRadius: widthPixel(16),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7F2",
    padding: widthPixel(10),
    marginBottom: heightPixel(8),
  },
  trendingBookmarkButton: {
    position: "absolute",
    top: heightPixel(16),
    right: widthPixel(16),
    zIndex: 2,
    width: widthPixel(30),
    height: heightPixel(30),
    borderRadius: widthPixel(15),
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  trendingImage: {
    width: "100%",
    height: heightPixel(100),
    borderRadius: widthPixel(12),
    marginBottom: heightPixel(8),
  },
  trendingTitle: {
    color: "#132843",
    fontSize: heightPixel(13),
    fontWeight: "700",
  },
  trendingAuthor: {
    marginTop: heightPixel(3),
    color: "#6C7C95",
    fontSize: heightPixel(11),
  },
  trendingPrice: {
    marginTop: heightPixel(6),
    color: "#0A2342",
    fontSize: heightPixel(13),
    fontWeight: "800",
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
  courseBookmarkButton: {
    width: widthPixel(28),
    height: heightPixel(28),
    borderRadius: widthPixel(14),
    backgroundColor: "#EEF3FA",
    alignItems: "center",
    justifyContent: "center",
  },
  courseTitle: {
    flex: 1,
    color: "#132843",
    fontSize: heightPixel(13),
    fontWeight: "700",
  },
  coursePrice: {
    color: "#0A2342",
    fontSize: heightPixel(12),
    fontWeight: "800",
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
  courseCategoryRow: {
    marginTop: heightPixel(7),
    flexDirection: "row",
    alignItems: "center",
  },
  inlineCategory: {
    marginRight: widthPixel(8),
    borderRadius: widthPixel(999),
    paddingVertical: heightPixel(4),
    paddingHorizontal: widthPixel(10),
    backgroundColor: "#EFF3FA",
  },
  inlineCategoryText: {
    color: "#30445F",
    fontSize: heightPixel(10),
    fontWeight: "600",
  },
});
