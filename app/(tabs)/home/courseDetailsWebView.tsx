import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildCourseDetailsHtml } from "@/src/utils/courseDetailsHtml";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

export default function CourseDetailsWebView() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    productData?: string;
    completionPercent?: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = useMemo(
    () =>
      isDark
        ? {
            screen: "#04060D",
            card: "#0E1322",
            cardBorder: "#212B45",
            textPrimary: "#EFF3FF",
            textSecondary: "#A9B6D8",
            accentStrong: "#3D68D8",
          }
        : {
            screen: "#EEF3FF",
            card: "#FFFFFF",
            cardBorder: "#DEE6F7",
            textPrimary: "#101A2F",
            textSecondary: "#5F6F8D",
            accentStrong: "#0A2342",
          },
    [isDark],
  );

  const product = useMemo(() => {
    if (!params.productData || typeof params.productData !== "string") {
      return null;
    }

    try {
      const decoded = decodeURIComponent(params.productData);
      return JSON.parse(decoded) as ProductDetails;
    } catch {
      return null;
    }
  }, [params.productData]);

  const completionPercent = useMemo(() => {
    const raw = Number(params.completionPercent ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [params.completionPercent]);

  const createdDate = useMemo(() => {
    if (!product?.createdAt) return "-";
    return new Date(product.createdAt).toLocaleDateString();
  }, [product?.createdAt]);

  const html = useMemo(() => {
    if (!product) return "";

    return buildCourseDetailsHtml({
      name: product.name,
      authorName: product.author_name,
      description: product.description,
      categories: product.categories ?? [],
      createdDate,
      priceLabel: formatPrice(product.price),
      completionPercent,
      isDark,
    });
  }, [completionPercent, createdDate, isDark, product]);

  if (!product) {
    return (
      <View style={[styles.emptyScreen, { backgroundColor: theme.screen }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </Pressable>
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Details unavailable
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Go back and try opening the page again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screen }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.roundIconButton,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Course Browser
        </Text>
        <View style={styles.roundIconButton} />
      </View>

      <View
        style={[
          styles.webviewWrap,
          { borderColor: theme.cardBorder, backgroundColor: theme.card },
        ]}
      >
        {/* <WebView
          source={{ html }}
          originWhitelist={["*"]}
          style={styles.webview}
          javaScriptEnabled
          scrollEnabled
          startInLoadingState
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: widthPixel(18),
    paddingTop: heightPixel(14),
    paddingBottom: heightPixel(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: heightPixel(12),
  },
  headerTitle: {
    fontSize: heightPixel(16),
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  roundIconButton: {
    width: widthPixel(36),
    height: heightPixel(36),
    borderRadius: widthPixel(18),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  webviewWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: widthPixel(16),
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  emptyScreen: {
    flex: 1,
    padding: widthPixel(18),
  },
  backButton: {
    width: widthPixel(38),
    height: heightPixel(38),
    borderRadius: widthPixel(19),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: heightPixel(12),
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: widthPixel(18),
    padding: widthPixel(18),
  },
  emptyTitle: {
    fontSize: heightPixel(16),
    fontWeight: "800",
  },
  emptySubtitle: {
    marginTop: heightPixel(6),
    fontSize: heightPixel(12),
    lineHeight: heightPixel(18),
  },
});
