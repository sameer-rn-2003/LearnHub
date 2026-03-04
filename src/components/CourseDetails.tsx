import { COLORS } from "@/src/constants/colors";
import { heightPixel, widthPixel } from "@/src/utils/Helper";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BottomEnrollBar from "@/src/components/BottomEnrollBar";
import BulletPoint from "@/src/components/BulletPoint";
import CourseHeader from "@/src/components/CourseHeader";
import CurriculumItem from "@/src/components/CurriculumItem";
import InfoStatCard from "@/src/components/InfoStatCard";
import InstructorInfo from "@/src/components/InstructorInfo";

export default function CourseDetails() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: heightPixel(120) }}
        showsVerticalScrollIndicator={false}
      >
        <CourseHeader />

        <View style={styles.image} />

        <Text style={styles.title}>Advanced UI/UX Design</Text>

        <Text style={styles.desc}>
          Master the art of creating pixel-perfect interfaces and seamless user
          experiences.
        </Text>

        <InstructorInfo />

        <View style={styles.statsRow}>
          <InfoStatCard label="Duration" value="24 Hours" />
          <InfoStatCard label="Level" value="Advanced" />
        </View>

        <Text style={styles.sectionTitle}>What you'll learn</Text>

        <BulletPoint text="Advanced prototyping techniques" />
        <BulletPoint text="Building and maintaining design systems" />
        <BulletPoint text="Psychology-based UI principles" />

        <Text style={styles.sectionTitle}>Curriculum</Text>

        <CurriculumItem title="Design Thinking deep dive" />
        <CurriculumItem title="Advanced Component Architecture" locked />
      </ScrollView>

      <BottomEnrollBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: widthPixel(20),
  },
  image: {
    height: heightPixel(200),
    backgroundColor: "#D1D5DB",
    borderRadius: widthPixel(20),
    marginBottom: heightPixel(16),
  },
  title: {
    fontSize: heightPixel(20),
    fontWeight: "700",
  },
  desc: {
    fontSize: heightPixel(13),
    marginTop: heightPixel(8),
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    marginVertical: heightPixel(16),
  },
  sectionTitle: {
    fontSize: heightPixel(15),
    fontWeight: "700",
    marginVertical: heightPixel(14),
  },
});
