import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f";

type ActiveCourseItem = {
  id: string;
  name: string;
  image: string;
  lessonsText: string;
  durationText: string;
  progressPercent: number;
};

const ACTIVE_COURSES: ActiveCourseItem[] = [
  {
    id: "course-1",
    name: "Python for Beginners",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    lessonsText: "24 lessons",
    durationText: "6h 30m",
    progressPercent: 65,
  },
  {
    id: "course-2",
    name: "UI/UX Fundamentals",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e",
    lessonsText: "18 lessons",
    durationText: "4h 15m",
    progressPercent: 32,
  },
  {
    id: "course-3",
    name: "Node.js Mastery",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    lessonsText: "20 lessons",
    durationText: "5h 10m",
    progressPercent: 49,
  },
];

const RECENTLY_VIEWED = [
  {
    id: "recent-1",
    name: "Advanced JS",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    timeAgo: "3 days ago",
  },
  {
    id: "recent-2",
    name: "Mastering React",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    timeAgo: "1 week ago",
  },
  {
    id: "recent-3",
    name: "Node.js",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
    timeAgo: "2 weeks ago",
  },
];

export default function MyCourses() {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: FALLBACK_IMAGE }} style={styles.avatar} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.helloText}>Hello, Alex!</Text>
            </View>
          </View>
          <View style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={heightPixel(16)}
              color="#4B5563"
            />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={heightPixel(16)} color="#9CA3AF" />
          <Text style={styles.searchText}>Search your courses...</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Courses</Text>
          <Text style={styles.viewAllText}>View all</Text>
        </View>

        {ACTIVE_COURSES.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseTopRow}>
              <Image
                source={{ uri: course.image || FALLBACK_IMAGE }}
                style={styles.courseImage}
              />

              <View style={styles.courseTitleWrap}>
                <Text numberOfLines={1} style={styles.courseTitle}>
                  {course.name}
                </Text>
                <Text style={styles.courseMeta}>
                  {course.lessonsText}  {course.durationText}
                </Text>
              </View>

              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={heightPixel(12)}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{course.progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${course.progressPercent}%` },
                ]}
              />
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}
        >
          {RECENTLY_VIEWED.map((course) => (
            <View key={course.id} style={styles.recentItem}>
              <Image
                source={{ uri: course.image || FALLBACK_IMAGE }}
                style={styles.recentImage}
              />
              <Text numberOfLines={1} style={styles.recentTitle}>
                {course.name}
              </Text>
              <Text style={styles.recentMeta}>{course.timeAgo}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <View style={styles.streakIconCircle}>
              <Ionicons name="flame" size={heightPixel(14)} color="#2F6FF2" />
            </View>
            <View>
              <Text style={styles.streakTitle}>5 Day Streak!</Text>
              <Text style={styles.streakSubtitle}>
                Keep it up, you&apos;re doing great!
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={heightPixel(18)} color="#2F6FF2" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
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
  avatarWrap: {
    width: widthPixel(34),
    height: heightPixel(34),
    borderRadius: widthPixel(17),
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
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
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    height: heightPixel(42),
    borderRadius: widthPixel(12),
    backgroundColor: "#ECEFF4",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPixel(10),
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: heightPixel(19),
    fontWeight: "800",
  },
  viewAllText: {
    color: "#2F6FF2",
    fontSize: heightPixel(12),
    fontWeight: "700",
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
  recentRow: {
    paddingTop: heightPixel(6),
    paddingBottom: heightPixel(14),
  },
  recentItem: {
    width: widthPixel(88),
    marginRight: widthPixel(10),
  },
  recentImage: {
    width: "100%",
    height: heightPixel(78),
    borderRadius: widthPixel(10),
    backgroundColor: "#E5E7EB",
    marginBottom: heightPixel(6),
  },
  recentTitle: {
    color: "#1F2937",
    fontSize: heightPixel(12),
    fontWeight: "700",
  },
  recentMeta: {
    color: "#9AA1AD",
    fontSize: heightPixel(10),
    marginTop: heightPixel(2),
  },
  streakCard: {
    backgroundColor: "#EAF0FF",
    borderRadius: widthPixel(14),
    borderWidth: 1,
    borderColor: "#D9E2FF",
    paddingVertical: heightPixel(11),
    paddingHorizontal: widthPixel(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: widthPixel(10),
  },
  streakIconCircle: {
    width: widthPixel(28),
    height: heightPixel(28),
    borderRadius: widthPixel(14),
    backgroundColor: "#DDE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    color: "#1F2937",
    fontSize: heightPixel(14),
    fontWeight: "800",
  },
  streakSubtitle: {
    marginTop: heightPixel(2),
    color: "#7180A0",
    fontSize: heightPixel(10),
    fontWeight: "600",
  },
});
