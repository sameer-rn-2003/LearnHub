import {
  getProductsWithCategoriesApi,
  ProductWithCategories,
} from "@/src/hooks/request";
import { useBookmarks } from "@/src/store/bookmarks";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  const [products, setProducts] = useState<ProductWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getProductsWithCategoriesApi();
      setProducts(response?.data?.data ?? []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to fetch search data. Please try again.";
      setErrorMessage(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((course) => {
      const matchesSearch =
        !normalizedQuery ||
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery) ||
        course.author_name.toLowerCase().includes(normalizedQuery) ||
        course.categories?.some((category) =>
          category.name.toLowerCase().includes(normalizedQuery),
        );

      return matchesSearch;
    });
  }, [products, query]);

  const hasSearchQuery = query.trim().length > 0;
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.bgShapeTop, { backgroundColor: colors.overlayTop }]} />
      <View style={[styles.bgShapeBottom, { backgroundColor: colors.overlayBottom }]} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
          Discover Courses
        </Text>

        <View
          style={[
            styles.searchContainer,
            { borderColor: colors.inputBorder, backgroundColor: colors.inputBg },
          ]}
        >
          <Ionicons name="search" size={heightPixel(18)} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title, author or category"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((categoryName) => {
            const active = categoryName === selectedCategory;
            return (
              <Pressable
                key={categoryName}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(categoryName)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {categoryName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView> */}

        {loading && (
          <View
            style={[
              styles.stateCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accentStrong} />
            <Text style={[styles.stateText, { color: colors.textSecondary }]}>
              Searching courses...
            </Text>
          </View>
        )}

        {!loading && !!errorMessage && (
          <View
            style={[
              styles.stateCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.accentStrong }]}
              onPress={fetchProducts}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && !errorMessage && !hasSearchQuery && (
          <View
            style={[
              styles.stateCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.stateText, { color: colors.textSecondary }]}>
              Start typing to search courses.
            </Text>
          </View>
        )}

        {!loading && !errorMessage && hasSearchQuery && (
          <>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                Search Results
              </Text>
              <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                {filteredProducts.length} items
              </Text>
            </View>

            {filteredProducts.length === 0 && (
              <View
                style={[
                  styles.stateCard,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                  No matching courses found.
                </Text>
              </View>
            )}

            {filteredProducts.map((course) => (
              <Pressable
                key={course?.id}
                style={[
                  styles.courseCard,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
                onPress={() => openProductDetails(course)}
              >
                <Image
                  source={{ uri: course?.images?.[0] || FALLBACK_IMAGE }}
                  style={styles.courseImage}
                />

                <View style={styles.courseBody}>
                  <View style={styles.courseTopRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.courseTitle, { color: colors.textPrimary }]}
                    >
                      {course?.name}
                    </Text>
                    <Pressable
                      onPress={(event) => {
                        event?.stopPropagation?.();
                        toggleBookmark(course);
                      }}
                      style={[styles.bookmarkButton, { backgroundColor: colors.accentSoft }]}
                    >
                      <Ionicons
                        name={
                          bookmarkedIds.has(course?.id)
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={heightPixel(16)}
                        color={
                          bookmarkedIds.has(course?.id) ? colors.accentStrong : colors.icon
                        }
                      />
                    </Pressable>
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[styles.courseDescription, { color: colors.textSecondary }]}
                  >
                    {course?.description}
                  </Text>
                  <Text style={[styles.courseAuthor, { color: colors.textSecondary }]}>
                    By {course?.author_name}
                  </Text>

                  <View style={styles.courseMetaRow}>
                    <Text style={[styles.coursePrice, { color: colors.accentStrong }]}>
                      {formatPrice(course?.price)}
                    </Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryInlineRow}>
                      {course.categories?.map((category) => (
                        <View key={category.id} style={styles.inlineChip}>
                          <Text style={[styles.inlineChipText, { color: colors.textSecondary }]}>
                            {category?.name}
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
  },
  bgShapeTop: {
    position: "absolute",
    top: -heightPixel(60),
    left: -widthPixel(70),
    width: widthPixel(210),
    height: heightPixel(210),
    borderRadius: widthPixel(105),
    backgroundColor: "rgba(10, 35, 66, 0.08)",
  },
  bgShapeBottom: {
    position: "absolute",
    bottom: -heightPixel(100),
    right: -widthPixel(50),
    width: widthPixel(200),
    height: heightPixel(200),
    borderRadius: widthPixel(100),
    backgroundColor: "rgba(212, 169, 79, 0.12)",
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
    marginBottom: heightPixel(14),
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
  resultHeader: {
    marginTop: heightPixel(10),
    marginBottom: heightPixel(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    color: "#10233F",
    fontSize: heightPixel(17),
    fontWeight: "800",
  },
  resultCount: {
    color: "#6C7C95",
    fontSize: heightPixel(12),
    fontWeight: "600",
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
  courseMetaRow: {
    marginTop: heightPixel(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coursePrice: {
    color: "#0A2342",
    fontSize: heightPixel(12),
    fontWeight: "800",
  },
  categoryInlineRow: {
    marginTop: heightPixel(7),
    flexDirection: "row",
    alignItems: "center",
  },
  inlineChip: {
    marginRight: widthPixel(8),
    borderRadius: widthPixel(999),
    paddingVertical: heightPixel(4),
    paddingHorizontal: widthPixel(10),
    backgroundColor: "#EFF3FA",
  },
  inlineChipText: {
    color: "#30445F",
    fontSize: heightPixel(10),
    fontWeight: "600",
  },
});
