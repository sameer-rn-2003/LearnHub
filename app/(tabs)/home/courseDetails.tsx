import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

type ProductCategory = {
  id: string;
  name: string;
};

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  author_name: string;
  images: string[];
  price: number;
  createdAt?: string;
  categories?: ProductCategory[];
};

const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

export default function CourseDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productData?: string }>();

  const product = useMemo(() => {
    if (!params.productData || typeof params.productData !== "string") {
      return null;
    }

    try {
      const decoded = decodeURIComponent(params.productData);
      const parsed = JSON.parse(decoded);
      return parsed as ProductDetails;
    } catch {
      return null;
    }
  }, [params.productData]);

  const createdDate = useMemo(() => {
    if (!product?.createdAt) return "";
    return new Date(product.createdAt).toLocaleDateString();
  }, [product?.createdAt]);

  if (!product) {
    return (
      <View style={styles.screen}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Text style={styles.headerTitle}>Product Details</Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>
              Product details are not available.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.iconButton} />
        </View>

        <Image
          source={{ uri: product.images?.[0] || FALLBACK_IMAGE }}
          style={styles.image}
        />

        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.authorText}>By {product.author_name}</Text>
        <Text style={styles.priceText}>{formatPrice(product.price)}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesRow}>
          {product.categories?.map((category) => (
            <View key={category.id} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.metaText}>Created: {createdDate || "-"}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>TOTAL PRICE</Text>
          <Text style={styles.totalPrice}>{formatPrice(product.price)}</Text>
        </View>

        <Pressable style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Enroll Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  contentContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(120),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: heightPixel(14),
  },
  iconButton: {
    width: widthPixel(32),
    height: heightPixel(32),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: heightPixel(16),
    fontWeight: "700",
    color: "#111827",
  },
  stateCard: {
    marginTop: heightPixel(24),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: widthPixel(14),
    padding: widthPixel(16),
    alignItems: "center",
  },
  errorText: {
    color: "#B42318",
    fontSize: heightPixel(13),
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: heightPixel(210),
    borderRadius: widthPixel(18),
    marginBottom: heightPixel(14),
  },
  title: {
    fontSize: heightPixel(22),
    fontWeight: "800",
    color: "#111827",
  },
  authorText: {
    marginTop: heightPixel(5),
    fontSize: heightPixel(13),
    color: "#4B5563",
  },
  priceText: {
    marginTop: heightPixel(10),
    fontSize: heightPixel(18),
    fontWeight: "700",
    color: "#0A2342",
  },
  sectionTitle: {
    marginTop: heightPixel(16),
    marginBottom: heightPixel(8),
    fontSize: heightPixel(15),
    fontWeight: "700",
    color: "#111827",
  },
  descriptionText: {
    fontSize: heightPixel(13),
    lineHeight: heightPixel(20),
    color: "#4B5563",
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: widthPixel(8),
  },
  categoryChip: {
    backgroundColor: "#E8EEF9",
    borderRadius: widthPixel(999),
    paddingVertical: heightPixel(5),
    paddingHorizontal: widthPixel(10),
  },
  categoryText: {
    color: "#1F3A63",
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  metaText: {
    marginTop: heightPixel(16),
    fontSize: heightPixel(12),
    color: "#6B7280",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: heightPixel(11),
    color: "#6B7280",
  },
  totalPrice: {
    fontSize: heightPixel(17),
    fontWeight: "800",
    color: "#111827",
  },
  enrollButton: {
    backgroundColor: "#4F46E5",
    borderRadius: widthPixel(18),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(18),
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: heightPixel(13),
    fontWeight: "700",
  },
});
