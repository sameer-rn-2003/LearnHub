import { heightPixel, widthPixel } from "@/src/utils/Helper";
import {
  CourseVideoProgress,
  EnrolledCourse,
  getCourseVideoProgress,
  getEnrolledCourses,
} from "@/src/store/offlineCourses";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

const DEFAULT_DURATION_SECONDS = 120;

type EnrolledCourseWithProgress = EnrolledCourse & {
  progress: CourseVideoProgress | null;
  progressPercent: number;
  progressLabel: string;
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const toProgressPercent = (progress: CourseVideoProgress | null) => {
  if (!progress) return 0;
  const duration = progress.durationSeconds || DEFAULT_DURATION_SECONDS;
  const safeDuration = Math.max(1, duration);
  const safePosition = progress.completed
    ? safeDuration
    : Math.max(0, progress.positionSeconds);
  const ratio = (safePosition / safeDuration) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
};

const toProgressLabel = (progress: CourseVideoProgress | null) => {
  if (!progress) return "Not started";
  if (progress.completed) return "Completed";
  if (progress.positionSeconds <= 0) return "Not started";
  return `Resume at ${formatTime(progress.positionSeconds)}`;
};

export default function MyCourses() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [courses, setCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEnrolledCourses = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const enrolledCourses = await getEnrolledCourses();
      const withProgress = await Promise.all(
        enrolledCourses.map(async (course) => {
          const progress = await getCourseVideoProgress(course.id);
          return {
            ...course,
            progress,
            progressPercent: toProgressPercent(progress),
            progressLabel: toProgressLabel(progress),
          } satisfies EnrolledCourseWithProgress;
        }),
      );

      withProgress.sort((a, b) => {
        const aTimestamp = a.progress?.updatedAt ?? a.enrolledAt;
        const bTimestamp = b.progress?.updatedAt ?? b.enrolledAt;
        return (
          new Date(bTimestamp).getTime() - new Date(aTimestamp).getTime()
        );
      });

      setCourses(withProgress);
    } catch {
      setErrorMessage("Unable to load enrolled courses.");
    } finally {
      if (isPullToRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEnrolledCourses();
    }, [loadEnrolledCourses]),
  );

  const completedCount = useMemo(
    () => courses.filter((course) => course.progressPercent >= 100).length,
    [courses],
  );

  const openCourseDetails = useCallback(
    (course: EnrolledCourseWithProgress) => {
      router.push({
        pathname: "/(tabs)/home/courseDetails",
        params: { productData: encodeURIComponent(JSON.stringify(course)) },
      });
    },
    [router],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (loading || refreshing) return;
              void loadEnrolledCourses(true);
            }}
            tintColor={colors.accentStrong}
            colors={[colors.accentStrong]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
                Your learning space
              </Text>
              <Text style={[styles.helloText, { color: colors.textPrimary }]}>
                My Courses
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.notificationButton,
              { backgroundColor: colors.accentSoft, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={heightPixel(16)}
              color={colors.icon}
            />
          </View>
        </View>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons name="book-outline" size={heightPixel(16)} color={colors.textMuted} />
          <Text style={[styles.searchText, { color: colors.textMuted }]}>
            {courses.length} enrolled  |  {completedCount} completed
          </Text>
        </View>

        {loading && (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accentStrong} />
            <Text style={[styles.stateText, { color: colors.textSecondary }]}>
              Loading your courses...
            </Text>
          </View>
        )}

        {!loading && !!errorMessage && (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.stateText, { color: colors.danger }]}>
              {errorMessage}
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.accentStrong }]}
              onPress={() => {
                void loadEnrolledCourses();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !errorMessage && courses.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="albums-outline" size={heightPixel(24)} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No enrolled courses yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              Enroll from course details to see progress here.
            </Text>
          </View>
        )}

        {!loading && !errorMessage && courses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Continue Learning
              </Text>
            </View>

            {courses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => openCourseDetails(course)}
                style={[
                  styles.courseCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.courseTopRow}>
                  <Image
                    source={{ uri: course.images?.[0] || FALLBACK_IMAGE }}
                    style={styles.courseImage}
                  />

                  <View style={styles.courseTitleWrap}>
                    <Text
                      numberOfLines={1}
                      style={[styles.courseTitle, { color: colors.textPrimary }]}
                    >
                      {course.name}
                    </Text>
                    <Text numberOfLines={1} style={[styles.courseMeta, { color: colors.textMuted }]}>
                      {course.author_name}
                    </Text>
                    <Text style={[styles.courseProgressLabel, { color: colors.textSecondary }]}>
                      {course.progressLabel}
                    </Text>
                  </View>

                  <View style={[styles.playButton, { backgroundColor: colors.accentStrong }]}>
                    <Ionicons name="play" size={heightPixel(12)} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    Progress
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.accentStrong }]}>
                    {course.progressPercent}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.inputBg }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${course.progressPercent}%` },
                      { backgroundColor: colors.accentStrong },
                    ]}
                  />
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
  contentContainer: {
    paddingHorizontal: widthPixel(14),
    paddingTop: heightPixel(14),
    paddingBottom: heightPixel(28),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPixel(14),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(8),
  },
  welcomeText: {
    color: "#9AA1AD",
    fontSize: heightPixel(10),
    fontWeight: "600",
  },
  helloText: {
    color: "#111827",
    fontSize: heightPixel(19),
    fontWeight: "800",
  },
  notificationButton: {
    width: widthPixel(30),
    height: heightPixel(30),
    borderRadius: widthPixel(10),
    backgroundColor: "#ECEFF4",
    borderWidth: 1,
    borderColor: "#DCE6F8",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    height: heightPixel(42),
    borderRadius: widthPixel(12),
    backgroundColor: "#ECEFF4",
    borderWidth: 1,
    borderColor: "#E2E8F4",
    paddingHorizontal: widthPixel(12),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPixel(16),
  },
  searchText: {
    marginLeft: widthPixel(8),
    color: "#9CA3AF",
    fontSize: heightPixel(12),
    fontWeight: "500",
  },
  sectionHeader: {
    marginBottom: heightPixel(8),
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: heightPixel(17),
    fontWeight: "800",
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: widthPixel(12),
    borderWidth: 1,
    borderColor: "#E7EAF0",
    padding: widthPixel(10),
    marginBottom: heightPixel(10),
  },
  courseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPixel(10),
  },
  courseImage: {
    width: widthPixel(46),
    height: heightPixel(46),
    borderRadius: widthPixel(9),
    marginRight: widthPixel(10),
  },
  courseTitleWrap: {
    flex: 1,
  },
  courseTitle: {
    color: "#1F2937",
    fontSize: heightPixel(14),
    fontWeight: "700",
  },
  courseMeta: {
    marginTop: heightPixel(2),
    color: "#9AA1AD",
    fontSize: heightPixel(11),
    fontWeight: "500",
  },
  courseProgressLabel: {
    marginTop: heightPixel(4),
    fontSize: heightPixel(10),
    fontWeight: "600",
  },
  playButton: {
    width: widthPixel(30),
    height: heightPixel(30),
    borderRadius: widthPixel(15),
    backgroundColor: "#2F6FF2",
    alignItems: "center",
    justifyContent: "center",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: heightPixel(5),
  },
  progressLabel: {
    color: "#7B8190",
    fontSize: heightPixel(11),
    fontWeight: "600",
  },
  progressPercent: {
    color: "#2F6FF2",
    fontSize: heightPixel(11),
    fontWeight: "700",
  },
  progressTrack: {
    height: heightPixel(5),
    borderRadius: widthPixel(4),
    backgroundColor: "#E7EAF0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2F6FF2",
  },
  stateCard: {
    marginTop: heightPixel(8),
    borderRadius: widthPixel(14),
    borderWidth: 1,
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(12),
    alignItems: "center",
    justifyContent: "center",
    gap: heightPixel(8),
  },
  stateText: {
    textAlign: "center",
    fontSize: heightPixel(12),
    fontWeight: "600",
  },
  retryButton: {
    borderRadius: widthPixel(10),
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(8),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  emptyCard: {
    marginTop: heightPixel(6),
    borderRadius: widthPixel(14),
    borderWidth: 1,
    paddingVertical: heightPixel(20),
    paddingHorizontal: widthPixel(14),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: heightPixel(8),
    fontSize: heightPixel(14),
    fontWeight: "800",
  },
  emptyBody: {
    marginTop: heightPixel(4),
    textAlign: "center",
    fontSize: heightPixel(11),
    lineHeight: heightPixel(17),
    fontWeight: "500",
  },
});
